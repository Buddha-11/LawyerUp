"""
Pinecone Service Module (Updated for 1024-dim LLaMA Embeddings)
"""

from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import os
import logging
import uuid

load_dotenv()
logger = logging.getLogger(__name__)


# ============================================================================
# PINECONE INITIALIZATION
# ============================================================================

def initialize_pinecone():
    """Connect to the Pinecone index defined in .env."""
    try:
        api_key = os.getenv('PINECONE_API_KEY')
        index_name = os.getenv('PINECONE_INDEX_NAME', 'lawyerup')

        if not api_key:
            raise ValueError("PINECONE_API_KEY environment variable is required")

        pc = Pinecone(api_key=api_key)
        index = pc.Index(index_name)
        stats = index.describe_index_stats()

        dim = os.getenv("PINECONE_DIM", "1024")
        metric = os.getenv("PINECONE_METRIC", "cosine")

        logger.info(f"Connected to Pinecone index '{index_name}' "
                    f"({dim}-dim, metric={metric}), total vectors={stats.get('total_vector_count', 'N/A')}")

        return index

    except Exception as e:
        logger.error(f"Failed to initialize Pinecone: {e}")
        raise


# ============================================================================
# DOCUMENT CHUNKING
# ============================================================================

def chunk_document(text, chunk_size=1000, chunk_overlap=200):
    """
    Split document text into overlapping chunks for embedding.
    Uses LangChain's RecursiveCharacterTextSplitter to intelligently
    split text at natural boundaries while maintaining context through overlap.
    """
    try:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        chunks = text_splitter.split_text(text)
        logger.info(f"Split document into {len(chunks)} chunks")
        return chunks
    except Exception as e:
        logger.error(f"Failed to chunk document: {e}")
        raise


# ============================================================================
# DOCUMENT INDEXING
# ============================================================================

def upsert_document_chunks(index, user_id, doc_name, chunks, embeddings):
    """Upload document chunks and their embeddings to Pinecone."""
    try:
        vectors_to_upsert = []

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            if embedding is None:
                logger.warning(f"Skipping chunk {i} due to missing embedding")
                continue

            vector_id = f"{user_id}_{doc_name}_{uuid.uuid4().hex[:8]}_{i}"

            metadata = {
                "user_id": user_id,
                "source": doc_name,
                "text": chunk[:1000],  # Pinecone metadata limit
                "chunk_index": i,
                "timestamp": str(int(os.times()[4]))
            }

            vectors_to_upsert.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })

        # Batch upsert (100 vectors per batch)
        batch_size = 100
        total_upserted = 0

        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i:i + batch_size]
            index.upsert(vectors=batch)
            total_upserted += len(batch)
            logger.info(f"Upserted batch {i // batch_size + 1}: {len(batch)} vectors")

        logger.info(f"Successfully indexed {total_upserted} chunks for user {user_id}")
        return total_upserted

    except Exception as e:
        logger.error(f"Failed to upsert chunks to Pinecone: {e}")
        raise


# ============================================================================
# VECTOR SEARCH OPERATIONS
# ============================================================================

def query_pinecone(index, user_id, query_vector, top_k=3, score_threshold=0.7):
    """Query Pinecone to find relevant documents for a given vector."""
    try:
        logger.info(f"Querying Pinecone for user: {user_id}, top_k: {top_k}")
        results = index.query(
            vector=query_vector,
            filter={"user_id": user_id},
            top_k=top_k,
            include_metadata=True
        )

        matches = []
        for match in results.get("matches", []):
            score = match.get("score", 0)
            if score >= score_threshold:
                metadata = match.get("metadata", {})
                matches.append({
                    "document_id": match["id"],
                    "score": score,
                    "text": metadata.get("text", ""),
                    "source": metadata.get("source", "Unknown"),
                    "timestamp": metadata.get("timestamp", None)
                })

        logger.info(f"Found {len(matches)} relevant documents (score ≥ {score_threshold})")
        if matches:
            top = matches[0]
            logger.info(f"Top match: {top['source']} (score: {top['score']:.3f})")
        return matches

    except Exception as e:
        logger.error(f"Pinecone query failed for user {user_id}: {e}")
        return []


# ============================================================================
# CLEANUP & UTILITIES
# ============================================================================

def delete_user_documents(index, user_id):
    """Delete all documents belonging to a specific user from Pinecone."""
    try:
        logger.warning(f"Deleting all vectors for user: {user_id}")
        index.delete(filter={"user_id": user_id})
        logger.info(f"Deleted vectors for user: {user_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete documents for {user_id}: {e}")
        return False


def check_user_document_count(index, user_id):
    """Count how many chunks a user has in Pinecone."""
    try:
        dummy_vector = [0.0] * 1024
        results = index.query(
            vector=dummy_vector,
            filter={"user_id": user_id},
            top_k=10000,
            include_metadata=False
        )
        count = len(results.get("matches", []))
        logger.info(f"User {user_id} has approximately {count} chunks indexed")
        return count
    except Exception as e:
        logger.error(f"Failed to count documents for {user_id}: {e}")
        return 0
