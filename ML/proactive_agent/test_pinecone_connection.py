"""
Pinecone Connection & Embedding Diagnostic Script

Tests different methods to connect to Pinecone and generate embeddings.
Run this to identify which approach works for your setup.
"""

import os
from dotenv import load_dotenv
from pinecone import Pinecone
import requests
import json

load_dotenv()

print("=" * 60)
print("PINECONE DIAGNOSTIC TEST")
print("=" * 60)

# Configuration
api_key = os.getenv("PINECONE_API_KEY")
region = os.getenv("PINECONE_REGION", "us-east-1")
index_name = os.getenv("PINECONE_INDEX_NAME", "lawyerup")

print(f"\n📋 Configuration:")
print(f"   API Key: {'✓ Set' if api_key else '✗ Missing'}")
print(f"   Region: {region}")
print(f"   Index Name: {index_name}")

if not api_key:
    print("\n❌ ERROR: PINECONE_API_KEY not found in .env")
    exit(1)

# ============================================================================
# TEST 1: Basic Pinecone Connection
# ============================================================================
print("\n" + "=" * 60)
print("TEST 1: Basic Pinecone Connection")
print("=" * 60)

try:
    pc = Pinecone(api_key=api_key)
    print("✓ Pinecone client initialized")
    
    # Try to connect to index
    index = pc.Index(index_name)
    stats = index.describe_index_stats()
    print(f"✓ Connected to index '{index_name}'")
    print(f"   Total vectors: {stats.get('total_vector_count', 0)}")
    print(f"   Dimensions: {stats.get('dimension', 'Unknown')}")
    
except Exception as e:
    print(f"✗ Failed: {e}")
    print("\nTroubleshooting:")
    print("  1. Verify PINECONE_API_KEY in .env")
    print("  2. Verify index name matches your Pinecone dashboard")
    print("  3. Check if index exists at https://app.pinecone.io/")
    exit(1)

# ============================================================================
# TEST 2: Regional Inference Endpoint (Current Method)
# ============================================================================
print("\n" + "=" * 60)
print("TEST 2: Regional Inference Endpoint")
print("=" * 60)

url = f"https://{region}-aws.pinecone.io/inference/embed"
print(f"Trying: {url}")

headers = {
    "Content-Type": "application/json",
    "Api-Key": api_key
}

payload = {
    "model": "llama-text-embed-v2",
    "inputs": ["test text"]
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    response.raise_for_status()
    data = response.json()
    vector = data["data"][0]["values"]
    print(f"✓ SUCCESS! Embedding dimension: {len(vector)}")
    print(f"   Model: llama-text-embed-v2")
    print(f"   Endpoint: {url}")
    
except requests.exceptions.ConnectionError as e:
    print(f"✗ DNS Resolution Failed: Cannot resolve {region}-aws.pinecone.io")
    print("\nPossible causes:")
    print("  1. Inference API not available in your region")
    print("  2. Wrong region specified in .env")
    print("  3. Network/firewall blocking Pinecone inference endpoints")
    
except requests.exceptions.HTTPError as e:
    print(f"✗ HTTP Error: {e}")
    print(f"   Response: {response.text if 'response' in locals() else 'N/A'}")
    
except Exception as e:
    print(f"✗ Unexpected error: {e}")

# ============================================================================
# TEST 3: Direct Index Inference (Alternative Method)
# ============================================================================
print("\n" + "=" * 60)
print("TEST 3: Pinecone Index-Based Inference")
print("=" * 60)

try:
    # Some Pinecone plans have inference through the index itself
    print("Checking if index supports inference...")
    
    # Try to get index host
    index_host = index._config.host
    print(f"Index host: {index_host}")
    
    # Try inference through index
    inference_url = f"https://{index_host}/embed"
    print(f"Trying: {inference_url}")
    
    response = requests.post(
        inference_url,
        headers=headers,
        json=payload,
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        vector = data["data"][0]["values"]
        print(f"✓ SUCCESS! Embedding dimension: {len(vector)}")
        print(f"   Alternative endpoint works!")
    else:
        print(f"✗ Failed: HTTP {response.status_code}")
        
except Exception as e:
    print(f"✗ Not supported: {e}")

# ============================================================================
# TEST 4: Check Pinecone Serverless vs Pod-Based
# ============================================================================
print("\n" + "=" * 60)
print("TEST 4: Index Type Detection")
print("=" * 60)

try:
    # List all indexes
    indexes = pc.list_indexes()
    print(f"Available indexes: {[idx.name for idx in indexes]}")
    
    # Get current index details
    current_index = next((idx for idx in indexes if idx.name == index_name), None)
    
    if current_index:
        print(f"\nIndex Details:")
        print(f"   Name: {current_index.name}")
        print(f"   Dimension: {current_index.dimension}")
        print(f"   Metric: {current_index.metric}")
        
        # Check if serverless or pod-based
        if hasattr(current_index, 'spec'):
            spec = current_index.spec
            if hasattr(spec, 'serverless'):
                print(f"   Type: Serverless")
                print(f"   Cloud: {spec.serverless.cloud}")
                print(f"   Region: {spec.serverless.region}")
            elif hasattr(spec, 'pod'):
                print(f"   Type: Pod-based")
                print(f"   Environment: {spec.pod.environment}")
        
except Exception as e:
    print(f"✗ Could not detect index type: {e}")

# ============================================================================
# RECOMMENDATIONS
# ============================================================================
print("\n" + "=" * 60)
print("RECOMMENDATIONS")
print("=" * 60)

print("\nBased on the tests above:")
print("\n1. If TEST 2 succeeded:")
print("   ✓ Current implementation is correct")
print("   ✓ Just ensure PINECONE_REGION in .env matches your index region")

print("\n2. If TEST 2 failed but TEST 3 succeeded:")
print("   → Update google_service.py to use index-based inference")
print("   → Use the alternative endpoint format")

print("\n3. If both TEST 2 and TEST 3 failed:")
print("   → Inference API might not be available in your plan")
print("   → Options:")
print("      a) Upgrade Pinecone plan")
print("      b) Use alternative embedding service (OpenAI, Cohere)")
print("      c) Run local embedding model (sentence-transformers)")

print("\n4. Network/Firewall issues:")
print("   → Check if corporate firewall blocks *.pinecone.io")
print("   → Try from different network")
print("   → Check DNS settings")

print("\n" + "=" * 60)
print("NEXT STEPS")
print("=" * 60)
print("\n1. Review test results above")
print("2. If TEST 2 failed, check your Pinecone dashboard:")
print("   https://app.pinecone.io/")
print("3. Verify your index region matches PINECONE_REGION in .env")
print("4. If inference API unavailable, I'll provide alternative solutions")

print("\n" + "=" * 60)