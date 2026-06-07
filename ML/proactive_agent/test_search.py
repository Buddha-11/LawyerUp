import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

from services.google_service import scan_public_sources

def test():
    terms = ["breach of contract", "liability", "damages"]
    print("Testing search...")
    try:
        articles = scan_public_sources(terms, days_back=30, max_results=10)
        print(f"Found articles: {len(articles)}")
        for a in articles:
            print(a['title'])
    except Exception as e:
        print(e)

if __name__ == "__main__":
    test()
