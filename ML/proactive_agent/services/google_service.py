"""
Google & Embedding Service Module (E5-Large-v2 Local Embeddings)

Handles:
- Google Custom Search API (for articles)
- Local E5-Large-v2 embeddings (1024-dim, optimized for retrieval)

Why E5-Large-v2:
- Specialized for semantic search and retrieval
- Normalized embeddings (better cosine similarity)
- Excellent performance on legal/technical text
- Handles query-document asymmetry well
"""

from duckduckgo_search import DDGS
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
import logging

# =====================================================================
# ENV + LOGGER
# =====================================================================
load_dotenv()
logger = logging.getLogger(__name__)

# =====================================================================
# LOCAL EMBEDDING MODEL SETUP
# =====================================================================
local_model = None

def initialize_llama_embeddings():
    """
    Initialize E5-Large-v2 embedding model.
    
    This model is optimized for:
    - Semantic retrieval (finding relevant documents)
    - Query-document matching
    - Legal and technical text understanding
    
    Produces 1024-dimensional normalized embeddings that work
    perfectly with Pinecone's cosine similarity metric.
    
    Returns:
        str: Model identifier
    """
    global local_model
    
    try:
        # Use local baked-in path if available (Docker/Cloud Run),
        # otherwise fall back to downloading from HuggingFace Hub.
        local_path = os.getenv("E5_MODEL_PATH", "")
        if local_path and os.path.isdir(local_path):
            model_name = local_path
            logger.info(f"Loading embedding model from local path: {model_name}")
        else:
            model_name = "intfloat/e5-large-v2"
            logger.info(f"Loading embedding model from HuggingFace Hub: {model_name}")
            logger.info("⏳ First load will download ~1.3GB model (one-time)")
        
        local_model = SentenceTransformer(model_name)
        
        # Test embedding to verify dimensions
        test_embedding = local_model.encode(
            "test", 
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        dim = len(test_embedding)
        
        if dim != 1024:
            logger.error(f"❌ Model dimension is {dim}, expected 1024")
            raise ValueError(f"Model produces {dim}-dim embeddings, need 1024-dim")
        
        logger.info(f"✅ E5-Large-v2 model loaded ({dim}-dim, normalized)")
        logger.info("   Optimized for semantic retrieval and legal text")
        
        return "e5-large-v2-local"
        
    except ImportError:
        logger.error("❌ sentence-transformers not installed")
        logger.error("Install with: pip install sentence-transformers")
        raise RuntimeError("sentence-transformers package required")
        
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        raise





# =====================================================================
# WEB SEARCH OPERATIONS
# =====================================================================

def scan_public_sources(extracted_terms, days_back=7, max_results=20):
    """Search the web for recent legal articles based on extracted terms using DuckDuckGo."""
    if not extracted_terms:
        logger.warning("No extracted terms provided for search")
        return []

    # DDGS works best with natural queries
    query = ' OR '.join([f'"{term}"' for term in extracted_terms[:5]])
    
    # DDGS date restriction: 'd' (past day), 'w' (past week), 'm' (past month), 'y' (past year)
    if days_back <= 1:
        timelimit = 'd'
    elif days_back <= 7:
        timelimit = 'w'
    elif days_back <= 30:
        timelimit = 'm'
    else:
        timelimit = 'y'

    articles = []
    try:
        logger.info(f"Querying DuckDuckGo: {query} (limit: {timelimit})")
        results = DDGS().text(query, timelimit=timelimit, max_results=max_results)
        
        for item in results:
            articles.append({
                'title': item.get('title', 'Untitled'),
                'link': item.get('href', ''),
                'snippet': item.get('body', '')
            })

        unique_articles = list({a['link']: a for a in articles}.values())
        logger.info(f"Total unique articles: {len(unique_articles)}")
        return unique_articles[:max_results]

    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise Exception(f"DuckDuckGo Search failed: {e}")


# =====================================================================
# E5-LARGE-V2 EMBEDDING FUNCTIONS
# =====================================================================

def get_embedding(text, embedding_model="e5-large-v2-local"):
    """
    Generate a 1024-dim normalized embedding for a single text.
    
    Uses E5-Large-v2 which is optimized for:
    - Semantic retrieval
    - Query-document matching
    - Cosine similarity comparisons
    
    Args:
        text (str): Text to embed (document chunk or query)
        embedding_model (str): Model identifier (for compatibility)
        
    Returns:
        list: 1024-dimensional normalized embedding vector
        
    Notes:
        - Embeddings are normalized (unit vectors)
        - Perfect for cosine similarity in Pinecone
        - Works for both long documents and short queries
    """
    try:
        if local_model is None:
            raise RuntimeError(
                "Embedding model not initialized. "
                "Call initialize_llama_embeddings() first."
            )
        
        # E5 models benefit from instruction prefixes
        # For documents: "passage: {text}"
        # For queries: "query: {text}"
        # But we'll keep it simple and let the model handle it
        
        vector = local_model.encode(
            text,
            normalize_embeddings=True,  # Critical for cosine similarity
            convert_to_numpy=True,
            show_progress_bar=False
        ).tolist()
        
        logger.debug(f"Generated embedding ({len(vector)} dims) for text length {len(text)}")
        return vector
        
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


def batch_get_embeddings(texts, embedding_model="e5-large-v2-local"):
    """
    Batch-generate normalized embeddings for multiple texts.
    
    This is much faster than calling get_embedding() individually
    because it processes texts in parallel on CPU/GPU.
    
    Args:
        texts (list): List of text strings to embed
        embedding_model (str): Model identifier (for compatibility)
        
    Returns:
        list: List of 1024-dimensional normalized embedding vectors
        
    Performance:
        - ~50-100 texts/second on modern CPU
        - ~500-1000 texts/second on GPU
        - Automatically uses available hardware
        
    Notes:
        - All embeddings are normalized (unit vectors)
        - Handles empty texts gracefully
        - Shows progress bar for large batches
    """
    try:
        if local_model is None:
            raise RuntimeError("Embedding model not initialized")
        
        if not texts:
            logger.warning("Empty text list provided to batch_get_embeddings")
            return []
        
        # Filter out empty texts but keep track of indices
        non_empty_texts = []
        non_empty_indices = []
        
        for i, text in enumerate(texts):
            if text and text.strip():
                non_empty_texts.append(text)
                non_empty_indices.append(i)
            else:
                logger.warning(f"Empty text at index {i}, will return None")
        
        if not non_empty_texts:
            logger.error("All texts are empty")
            return [None] * len(texts)
        
        logger.info(f"Batch encoding {len(non_empty_texts)} texts...")
        
        # Batch encode with progress bar for large batches
        embeddings = local_model.encode(
            non_empty_texts,
            normalize_embeddings=True,  # Critical for cosine similarity
            convert_to_numpy=True,
            show_progress_bar=len(non_empty_texts) > 10,
            batch_size=32  # Optimal for most hardware
        )
        
        # Convert to list format
        embeddings_list = embeddings.tolist()
        
        # Reconstruct full list with None for empty texts
        result = [None] * len(texts)
        for i, embedding in zip(non_empty_indices, embeddings_list):
            result[i] = embedding
        
        successful = sum(1 for e in result if e is not None)
        logger.info(
            f"✅ Batch embedding complete "
            f"({successful}/{len(texts)} vectors, 1024 dims each)"
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Batch embedding failed: {e}")
        logger.warning("Falling back to individual encoding...")
        
        # Fallback: encode one by one
        result = []
        for i, text in enumerate(texts):
            try:
                if text and text.strip():
                    vector = get_embedding(text, embedding_model)
                    result.append(vector)
                else:
                    result.append(None)
            except Exception as e:
                logger.error(f"Failed to embed text index {i}: {e}")
                result.append(None)
        
        return result


# =====================================================================
# UTILITY FUNCTIONS
# =====================================================================

def get_query_embedding(query_text):
    """
    Generate embedding specifically for query text.
    
    For E5 models, queries can optionally be prefixed with "query: "
    for optimal performance. This function handles that.
    
    Args:
        query_text (str): Query text (e.g., article summary)
        
    Returns:
        list: 1024-dimensional normalized embedding
    """
    # E5 models work better with explicit query prefix
    # But it's optional - the model is robust enough without it
    prefixed_query = f"query: {query_text}"
    return get_embedding(prefixed_query)


def get_document_embedding(document_text):
    """
    Generate embedding specifically for document text.
    
    For E5 models, documents can optionally be prefixed with "passage: "
    for optimal performance.
    
    Args:
        document_text (str): Document text (e.g., case file chunk)
        
    Returns:
        list: 1024-dimensional normalized embedding
    """
    # E5 models work better with explicit passage prefix
    # But it's optional
    prefixed_doc = f"passage: {document_text}"
    return get_embedding(prefixed_doc)


def verify_model_ready():
    """
    Check if embedding model is loaded and ready.
    
    Returns:
        bool: True if model is ready, False otherwise
    """
    return local_model is not None


def get_model_info():
    """
    Get information about the loaded embedding model.
    
    Returns:
        dict: Model information
    """
    if local_model is None:
        return {
            'loaded': False,
            'model_name': None,
            'dimensions': None
        }
    
    test_embedding = local_model.encode(
        "test",
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    
    return {
        'loaded': True,
        'model_name': 'intfloat/e5-large-v2',
        'dimensions': len(test_embedding),
        'normalized': True,
        'optimized_for': 'semantic retrieval'
    }