"""
Pipeline Module - Workflow Orchestration

This module orchestrates the complete case monitoring workflows:
1. Case file upload pipeline (extract → save → chunk → index)
2. Article search pipeline (fetch terms → search web)
3. Article analysis pipeline (summarize → embed → query → RAG → alert)

Each function represents a complete user-facing operation.
"""

import logging
from .firebase_service import (
    get_profile_from_firestore,
    update_profile_metadata,
    save_alert_to_firestore
)
from .extraction_service import run_extraction_pipeline, validate_extraction_results
from .pinecone_service import chunk_document, upsert_document_chunks, query_pinecone
from .google_service import scan_public_sources, get_embedding, batch_get_embeddings
from .gemini_service import summarize_articles, generate_actionable_alert

logger = logging.getLogger(__name__)


# ============================================================================
# CASE FILE UPLOAD PIPELINE
# ============================================================================

def process_case_file_upload(db, pinecone_index, gemini_model, embedding_model, 
                             ner_pipeline, user_id, pdf_file):
    """
    Complete workflow for processing an uploaded case file.
    
    This function orchestrates the entire case file setup process:
    1. Check upload limit
    2. Extract legal entities and concepts (Black Box)
    3. Save extracted terms to Firestore profile
    4. Chunk the document text
    5. Generate embeddings for each chunk
    6. Upload chunks to Pinecone
    7. Update upload count
    
    Args:
        db (firestore.Client): Firestore database client
        pinecone_index (pinecone.Index): Pinecone vector database
        gemini_model (genai.GenerativeModel): Gemini AI model
        embedding_model (str): Gemini embedding model name
        ner_pipeline (transformers.Pipeline): Legal NER model
        user_id (str): Authenticated user's ID
        pdf_file (FileStorage): Uploaded PDF file
        
    Returns:
        dict: Processing results containing:
            - success (bool): Whether operation completed
            - doc_name (str): Name of uploaded file
            - extracted_terms_count (int): Number of search terms
            - chunks_indexed (int): Number of chunks saved
            - extracted_terms (list): The search terms
            - error (str, optional): Error message if failed
    """
    logger.info(f"=== Case File Upload Pipeline for user: {user_id} ===")
    
    result = {
        'success': False,
        'doc_name': pdf_file.filename,
        'extracted_terms_count': 0,
        'chunks_indexed': 0,
        'extracted_terms': []
    }
    
    try:
        # ====================================================================
        # STEP 1: Check Upload Limit
        # ====================================================================
        logger.info("[STEP 1/7] Checking upload limit...")
        
        profile = get_profile_from_firestore(db, user_id)
        upload_count = profile.get('doc_upload_count', 0)
        
        logger.info(f"✓ Upload allowed (Ignoring limits for testing)")
        
        # ====================================================================
        # STEP 2: Run Extraction Pipeline (Black Box)
        # ====================================================================
        logger.info("[STEP 2/7] Running extraction pipeline...")
        
        extraction_result = run_extraction_pipeline(
            pdf_file=pdf_file,
            gemini_model=gemini_model,
            ner_pipeline=ner_pipeline
        )
        
        # Validate extraction
        is_valid, error_msg = validate_extraction_results(extraction_result)
        if not is_valid:
            logger.error(f"Extraction validation failed: {error_msg}")
            result['error'] = error_msg
            return result
        
        full_text = extraction_result['full_text']
        extracted_terms = extraction_result['extracted_search_terms']
        
        result['extracted_terms'] = extracted_terms
        result['extracted_terms_count'] = len(extracted_terms)
        
        logger.info(f"✓ Extracted {len(extracted_terms)} search terms")
        
        # ====================================================================
        # STEP 3: Save Extracted Terms to Firestore
        # ====================================================================
        logger.info("[STEP 3/7] Saving extracted terms to profile...")
        
        update_profile_metadata(db, user_id, {
            'monitored_doc_name': pdf_file.filename,
            'extracted_search_terms': extracted_terms
        })
        
        logger.info("✓ Profile updated with search terms")
        
        # ====================================================================
        # STEP 4: Chunk the Document
        # ====================================================================
        logger.info("[STEP 4/7] Chunking document text...")
        
        chunks = chunk_document(
            text=full_text,
            chunk_size=1000,
            chunk_overlap=200
        )
        
        logger.info(f"✓ Created {len(chunks)} chunks")
        
        # ====================================================================
        # STEP 5: Generate Embeddings for Chunks
        # ====================================================================
        logger.info("[STEP 5/7] Generating embeddings...")
        
        embeddings = batch_get_embeddings(chunks, embedding_model)

        
        # Filter out None values (failed embeddings)
        valid_pairs = [(c, e) for c, e in zip(chunks, embeddings) if e is not None]
        
        if not valid_pairs:
            result['error'] = "Failed to generate embeddings for document chunks"
            return result
        
        valid_chunks, valid_embeddings = zip(*valid_pairs)
        
        logger.info(f"✓ Generated {len(valid_embeddings)} embeddings")
        
        # ====================================================================
        # STEP 6: Upload to Pinecone
        # ====================================================================
        logger.info("[STEP 6/7] Uploading to Pinecone...")
        
        chunks_indexed = upsert_document_chunks(
            index=pinecone_index,
            user_id=user_id,
            doc_name=pdf_file.filename,
            chunks=list(valid_chunks),
            embeddings=list(valid_embeddings)
        )
        
        result['chunks_indexed'] = chunks_indexed
        
        logger.info(f"✓ Indexed {chunks_indexed} chunks")
        
        # ====================================================================
        # STEP 7: Update Upload Count
        # ====================================================================
        logger.info("[STEP 7/7] Updating upload count...")
        
        update_profile_metadata(db, user_id, {
            'doc_upload_count': upload_count + 1
        })
        
        logger.info("✓ Upload count incremented")
        
        # ====================================================================
        # Success!
        # ====================================================================
        result['success'] = True
        logger.info("=== Case File Upload Pipeline Complete ===")
        
        return result
        
    except Exception as e:
        logger.error(f"Case file upload pipeline failed: {e}")
        result['error'] = str(e)
        return result


# ============================================================================
# ARTICLE SEARCH PIPELINE
# ============================================================================

def run_article_search_pipeline(db, user_id, days_back=7, max_results=20):
    """
    Search for relevant articles based on extracted case terms.
    
    This is Step 1 of the two-step workflow. It retrieves the user's
    extracted search terms and searches the web for recent articles.
    
    Args:
        db (firestore.Client): Firestore database client
        search_service (googleapiclient.discovery.Resource): Google Search API
        user_id (str): Authenticated user's ID
        days_back (int): Days to search back (1-30)
        max_results (int): Maximum articles to return (1-50)
        
    Returns:
        dict: Search results containing:
            - success (bool): Whether search completed
            - articles_found (int): Number of articles discovered
            - articles (list): List of article dictionaries
            - search_query (str): The query used
            - error (str, optional): Error message if failed
    """
    logger.info(f"=== Article Search Pipeline for user: {user_id} ===")
    
    result = {
        'success': False,
        'articles_found': 0,
        'articles': [],
        'search_query': ''
    }
    
    try:
        # ====================================================================
        # STEP 1: Fetch Profile and Extracted Terms
        # ====================================================================
        logger.info("[STEP 1/2] Fetching user profile...")
        
        profile = get_profile_from_firestore(db, user_id)
        extracted_terms = profile.get('extracted_search_terms', [])
        
        if not extracted_terms:
            result['error'] = 'No case file uploaded. Please upload a case file first.'
            return result
        
        logger.info(f"✓ Retrieved {len(extracted_terms)} search terms")
        
        # ====================================================================
        # STEP 2: Search for Articles
        # ====================================================================
        logger.info("[STEP 2/2] Searching web for articles...")
        
        articles = scan_public_sources(
            extracted_terms=extracted_terms,
            days_back=days_back,
            max_results=max_results
        )
        
        result['articles'] = articles
        result['articles_found'] = len(articles)
        result['search_query'] = ' OR '.join([f'"{term}"' for term in extracted_terms[:10]])
        result['success'] = True
        
        logger.info(f"✓ Found {len(articles)} articles")
        logger.info("=== Article Search Pipeline Complete ===")
        
        return result
        
    except Exception as e:
        logger.error(f"Article search pipeline failed: {e}")
        result['error'] = str(e)
        return result


# ============================================================================
# ARTICLE ANALYSIS PIPELINE
# ============================================================================

def run_article_analysis_pipeline(db, gemini_model, embedding_model, 
                                 pinecone_index, user_id, articles):
    """
    Analyze selected articles against user's case documents.
    
    This is Step 2 of the two-step workflow. It processes user-selected
    articles through the complete RAG pipeline to generate actionable alerts.
    
    Workflow:
    1. Summarize each article with Gemini
    2. Generate embeddings for summaries
    3. Query Pinecone for relevant case chunks
    4. Perform RAG-based impact analysis
    5. Save high-impact findings as alerts
    
    Args:
        db (firestore.Client): Firestore database client
        gemini_model (genai.GenerativeModel): Gemini AI model
        embedding_model (str): Gemini embedding model name
        pinecone_index (pinecone.Index): Pinecone vector database
        user_id (str): Authenticated user's ID
        articles (list): List of article dicts (title, link, snippet)
        
    Returns:
        dict: Analysis results containing:
            - success (bool): Whether analysis completed
            - articles_analyzed (int): Number of articles processed
            - alerts_created (int): Number of alerts saved
            - alerts (list): Details of each alert
            - error (str, optional): Error message if failed
    """
    logger.info(f"=== Article Analysis Pipeline for user: {user_id} ===")
    
    result = {
        'success': False,
        'articles_analyzed': 0,
        'alerts_created': 0,
        'alerts': []
    }
    
    try:
        # ====================================================================
        # STEP 1: Summarize Articles
        # ====================================================================
        logger.info("[STEP 1/5] Summarizing articles...")
        
        briefings = summarize_articles(gemini_model, articles)
        
        # articles_analyzed reflects how many articles Gemini successfully
        # summarized — this is the true measure of work done, regardless
        # of whether they produced alerts after Pinecone matching.
        result['articles_analyzed'] = len(briefings)
        
        if not briefings:
            logger.warning("No briefings generated")
            result['success'] = True
            return result
        
        logger.info(f"✓ Generated {len(briefings)} summaries")
        
        # ====================================================================
        # STEP 2-5: Process Each Briefing
        # ====================================================================
        alerts_created = []
        
        for i, briefing in enumerate(briefings):
            logger.info(f"[Processing {i+1}/{len(briefings)}] {briefing['title'][:50]}...")
            
            try:
                # ============================================================
                # STEP 2: Generate Embedding
                # ============================================================
                logger.info("  [STEP 2/5] Generating embedding...")
                
                query_text = f"{briefing['title']} {briefing['summary']}"
                query_vector = get_embedding(query_text, embedding_model)
                
                logger.info("  ✓ Embedding generated")
                
                # ============================================================
                # STEP 3: Query Pinecone for Relevant Chunks
                # ============================================================
                logger.info("  [STEP 3/5] Querying Pinecone...")
                
                # score_threshold lowered to 0.4 — cross-domain cosine similarity
                # between news snippets and legal doc chunks is typically 0.3–0.6.
                # The original 0.7 threshold was silently skipping every article.
                pinecone_matches = query_pinecone(
                    index=pinecone_index,
                    user_id=user_id,
                    query_vector=query_vector,
                    top_k=3,
                    score_threshold=0.4
                )
                
                if not pinecone_matches:
                    logger.info("  ⊘ No relevant case chunks found (score < 0.4) - skipping")
                    continue
                
                logger.info(f"  ✓ Found {len(pinecone_matches)} relevant chunks")
                
                # ============================================================
                # STEP 4: RAG-Based Impact Analysis
                # ============================================================
                logger.info("  [STEP 4/5] Analyzing impact...")
                
                impact_analysis = generate_actionable_alert(
                    gemini_model=gemini_model,
                    briefing=briefing,
                    pinecone_matches=pinecone_matches
                )
                
                if not impact_analysis:
                    logger.info("  ⊘ No significant impact detected - skipping")
                    continue
                
                logger.info("  ✓ Impact analysis complete")
                
                # ============================================================
                # STEP 5: Save Alert to Firestore
                # ============================================================
                logger.info("  [STEP 5/5] Saving alert...")
                
                # Determine priority based on matches
                avg_score = sum(m['score'] for m in pinecone_matches) / len(pinecone_matches)
                priority = 'high' if (len(pinecone_matches) > 1 and avg_score > 0.8) else 'medium'
                
                alert_data = {
                    'title': briefing['title'],
                    'article_link': briefing['link'],
                    'summary': briefing['summary'],
                    'impact_analysis': impact_analysis,
                    'related_documents': [
                        {
                            'document_id': match['document_id'],
                            'relevance_score': match['score'],
                            'source': match['source']
                        }
                        for match in pinecone_matches
                    ],
                    'priority': priority
                }
                
                alert_id = save_alert_to_firestore(db, user_id, alert_data)
                
                alerts_created.append({
                    'alert_id': alert_id,
                    'title': briefing['title'],
                    'priority': priority,
                    'related_docs_count': len(pinecone_matches)
                })
                
                logger.info(f"  ✓ Alert saved: {alert_id} (Priority: {priority})")
                
            except Exception as e:
                logger.error(f"  ✗ Failed to process briefing: {e}")
                continue
        
        # ====================================================================
        # Results Summary
        # ====================================================================
        result['alerts_created'] = len(alerts_created)
        result['alerts'] = alerts_created
        result['success'] = True
        
        logger.info(f"=== Pipeline Complete: {len(alerts_created)} alerts created ===")
        
        return result
        
    except Exception as e:
        logger.error(f"Article analysis pipeline failed: {e}")
        result['error'] = str(e)
        return result


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_case_upload_inputs(user_id, pdf_file):
    """
    Validate inputs for case file upload.
    
    Args:
        user_id (str): User identifier
        pdf_file (FileStorage): Uploaded file
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not user_id or not isinstance(user_id, str):
        return False, "Invalid user_id"
    
    if not pdf_file or not pdf_file.filename:
        return False, "Invalid PDF file"
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return False, "File must be a PDF"
    
    # Check file size (limit to 10MB)
    pdf_file.seek(0, 2)  # Seek to end
    file_size = pdf_file.tell()
    pdf_file.seek(0)  # Reset
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        return False, "PDF file too large (maximum 10MB)"
    
    return True, None


def validate_article_analysis_inputs(user_id, articles):
    """
    Validate inputs for article analysis.
    
    Args:
        user_id (str): User identifier
        articles (list): List of article dictionaries
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not user_id or not isinstance(user_id, str):
        return False, "Invalid user_id"
    
    if not articles or not isinstance(articles, list):
        return False, "Articles must be a non-empty list"
    
    if len(articles) == 0:
        return False, "No articles provided for analysis"
    
    if len(articles) > 20:
        return False, "Too many articles (maximum 20 per request)"
    
    # Validate article structure
    for i, article in enumerate(articles):
        if not isinstance(article, dict):
            return False, f"Article {i} is not a valid dictionary"
        
        # 'title' and 'link' are required; 'snippet' is optional (may be empty)
        required_fields = ['title', 'link']
        for field in required_fields:
            if field not in article:
                return False, f"Article {i} missing required field: {field}"
            
            if not article[field] or not isinstance(article[field], str):
                return False, f"Article {i} has invalid {field}"
        
        # Ensure snippet exists (even if empty) so downstream code is safe
        if 'snippet' not in article:
            article['snippet'] = ''
    
    return True, None


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_pipeline_status(user_id, db):
    """
    Get the current status of a user's case monitoring setup.
    
    Args:
        user_id (str): User identifier
        db (firestore.Client): Firestore client
        
    Returns:
        dict: Status information including:
            - has_uploaded_case (bool)
            - extracted_terms_count (int)
            - upload_count (int)
            - upload_limit (int)
            - monitored_doc_name (str)
    """
    try:
        profile = get_profile_from_firestore(db, user_id)
        
        return {
            'has_uploaded_case': bool(profile.get('monitored_doc_name')),
            'extracted_terms_count': len(profile.get('extracted_search_terms', [])),
            'upload_count': profile.get('doc_upload_count', 0),
            'upload_limit': profile.get('doc_upload_limit', 100),
            'monitored_doc_name': profile.get('monitored_doc_name')
        }
        
    except Exception as e:
        logger.error(f"Failed to get pipeline status: {e}")
        return None
                