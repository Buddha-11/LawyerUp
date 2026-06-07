# test_pinecone.py
from dotenv import load_dotenv
load_dotenv()                # pip install python-dotenv
import os
from pinecone import Pinecone

API_KEY = os.getenv("PINECONE_API_KEY")
IDX = os.getenv("PINECONE_INDEX_NAME", "lawyerup")
DIM = int(os.getenv("PINECONE_DIM", "1024"))

if not API_KEY:
    raise SystemExit("PINECONE_API_KEY not found in env")

pc = Pinecone(api_key=API_KEY)
print("client ok")

# list indexes (auth check)
print("indexes:", pc.list_indexes())

# connect to index and print basic stats (may raise if name wrong)
index = pc.Index(IDX)
print("index stats:", index.describe_index_stats())

# run a dummy query (sanity)
resp = index.query(vector=[0.0] * DIM, top_k=1, include_metadata=True)
print("query ok:", resp)
