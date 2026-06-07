"""
Services package for the Proactive Case Monitoring Agent.

This package contains modular service files that handle specific responsibilities:
- firebase_service: Firebase authentication and Firestore operations
- google_service: Google Search API and Gemini embeddings
- gemini_service: Gemini generative AI for summarization and analysis
- pinecone_service: Vector database queries and document indexing
- extraction_service: Legal NER and concept extraction (Black Box)
- pipeline: Main orchestration logic
"""

__all__ = [
    'firebase_service',
    'google_service',
    'gemini_service',
    'pinecone_service',
    'extraction_service',
    'pipeline'
]