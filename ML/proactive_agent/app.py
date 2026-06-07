"""
Flask Application - Proactive Case Monitoring Agent

This is the main web server for the case monitoring service. It handles:
- Case file upload and extraction
- Two-step article workflow (search + analyze)
- Authentication via Firebase tokens
- Coordination between services
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Import service modules
from services.firebase_service import (
    initialize_firebase, 
    verify_token,
    get_profile_from_firestore,
    update_profile_metadata
)
from services.google_service import (
    initialize_llama_embeddings
)
from services.gemini_service import initialize_gemini_generative_model
from services.pinecone_service import initialize_pinecone
from services.extraction_service import initialize_legal_ner_model
from services.pipeline import (
    process_case_file_upload,
    run_article_search_pipeline,
    run_article_analysis_pipeline,
    validate_case_upload_inputs,
    validate_article_analysis_inputs
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(name)s %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# ============================================================================
# FLASK APPLICATION SETUP
# ============================================================================

app = Flask(__name__)
CORS(app)

logger.info("Initializing Proactive Case Monitoring Agent...")

# ============================================================================
# INITIALIZE ALL SERVICES AT STARTUP
# ============================================================================

try:
    # Firebase
    db = initialize_firebase()
    logger.info("✓ Firebase initialized")
    
    # DuckDuckGo Search (no initialization required)
    logger.info("✓ DuckDuckGo Search ready")
    
    # Gemini (Generative)
    gemini_model = initialize_gemini_generative_model()
    logger.info("✓ Gemini generative model initialized")
    
    # Gemini (Embeddings)
    embedding_model =  initialize_llama_embeddings()
    logger.info("✓ Gemini embeddings initialized")
    
    # Pinecone
    pinecone_index = initialize_pinecone()
    logger.info("✓ Pinecone initialized")
    
    # Legal NER Model
    ner_pipeline = initialize_legal_ner_model()
    logger.info("✓ Legal NER model initialized")
    
    logger.info("=== All services initialized successfully ===")
    
except Exception as e:
    logger.error(f"Failed to initialize services: {e}")
    raise


# ============================================================================
# ROUTE: HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'service': 'proactive-case-monitoring-agent',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 200


# ============================================================================
# ROUTE: UPLOAD CASE FILE
# ============================================================================

@app.route('/api/v1/upload-case-file', methods=['POST'])
def upload_case_file():
    """
    Upload and process a case file to set up monitoring.
    
    This endpoint orchestrates the complete case file setup:
    1. Authenticates the user via Firebase token
    2. Validates upload limit
    3. Extracts legal entities and concepts from the PDF
    4. Saves extracted search terms to Firestore profile
    5. Chunks, embeds, and indexes document to Pinecone
    6. Updates upload count
    
    Request Headers:
        Authorization (str): Firebase ID token in format "Bearer <token>"
        
    Request Body (multipart/form-data):
        file: PDF file of the case document
        
    Returns:
        JSON response with:
            - success (bool): Whether operation completed successfully
            - user_id (str): Authenticated user's identifier
            - doc_name (str): Name of uploaded file
            - extracted_terms_count (int): Number of search terms extracted
            - chunks_indexed (int): Number of chunks saved to Pinecone
            - extracted_terms (list): The extracted search terms
            - error (str, optional): Error description if failed
            
    Status Codes:
        - 200 OK: Case file processed successfully
        - 400 Bad Request: Invalid input or upload limit reached
        - 401 Unauthorized: Missing or invalid authentication token
        - 500 Internal Server Error: Unexpected server error
    """
    try:
        # ====================================================================
        # AUTHENTICATION
        # ====================================================================
        logger.info("Received case file upload request")
        
        try:
            user_id = verify_token(request)
        except ValueError as e:
            logger.warning(f"Authentication failed: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 401
        
        logger.info(f"User authenticated: {user_id}")
        
        # ====================================================================
        # VALIDATE FILE UPLOAD
        # ====================================================================
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided in request'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Empty filename'
            }), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                'success': False,
                'error': 'Only PDF files are supported'
            }), 400
        
        # Validate inputs
        is_valid, error_msg = validate_case_upload_inputs(user_id, file)
        if not is_valid:
            logger.warning(f"Invalid upload: {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # ====================================================================
        # PROCESS CASE FILE
        # ====================================================================
        result = process_case_file_upload(
            db=db,
            pinecone_index=pinecone_index,
            gemini_model=gemini_model,
            embedding_model=embedding_model,
            ner_pipeline=ner_pipeline,
            user_id=user_id,
            pdf_file=file
        )
        
        # ====================================================================
        # HANDLE RESULTS
        # ====================================================================
        if not result['success']:
            error = result.get('error', 'Unknown error occurred')
            logger.error(f"Case file processing failed for {user_id}: {error}")
            return jsonify({
                'success': False,
                'error': error
            }), 500
        
        logger.info(f"Case file processed successfully for {user_id}")
        
        response = {
            'success': True,
            'user_id': user_id,
            'doc_name': result['doc_name'],
            'extracted_terms_count': result['extracted_terms_count'],
            'chunks_indexed': result['chunks_indexed'],
            'extracted_terms': result['extracted_terms']
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_case_file: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500


# ============================================================================
# ROUTE: SEARCH ARTICLES (STEP 1)
# ============================================================================

@app.route('/api/v1/search-articles', methods=['POST'])
def search_articles():
    """
    Search for recent articles based on extracted case terms.
    
    This is Step 1 of the two-step workflow. It searches the web for
    articles related to the legal entities and concepts extracted from
    the user's case file.
    
    Request Headers:
        Authorization (str): Firebase ID token in format "Bearer <token>"
        
    Request Body (JSON, optional):
        {
            "days_back": int,      // Days to search back (1-30, default: 7)
            "max_results": int     // Max articles to return (1-50, default: 20)
        }
        
    Returns:
        JSON response with:
            - success (bool): Whether operation completed successfully
            - user_id (str): Authenticated user's identifier
            - articles_found (int): Number of articles discovered
            - articles (list): Article details (title, link, snippet, etc.)
            - search_query (str): The query used for searching
            - message (str, optional): Informational message
            - error (str, optional): Error description if failed
            
    Status Codes:
        - 200 OK: Search completed successfully
        - 400 Bad Request: Invalid parameters or no case file uploaded
        - 401 Unauthorized: Missing or invalid authentication token
        - 500 Internal Server Error: Unexpected server error
    """
    try:
        # ====================================================================
        # AUTHENTICATION
        # ====================================================================
        logger.info("Received article search request")
        
        try:
            user_id = verify_token(request)
        except ValueError as e:
            logger.warning(f"Authentication failed: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 401
        
        logger.info(f"User authenticated: {user_id}")
        
        # ====================================================================
        # PARSE REQUEST PARAMETERS
        # ====================================================================
        data = request.json or {}
        days_back = data.get('days_back', 7)
        max_results = data.get('max_results', 20)
        
        # Validate parameters
        if not isinstance(days_back, int) or days_back < 1:
            return jsonify({
                'success': False,
                'error': 'days_back must be a positive integer'
            }), 400
        
        if not isinstance(max_results, int) or max_results < 1 or max_results > 50:
            return jsonify({
                'success': False,
                'error': 'max_results must be an integer between 1 and 50'
            }), 400
        
        logger.info(f"Parameters: days_back={days_back}, max_results={max_results}")
        
        # ====================================================================
        # RUN SEARCH PIPELINE
        # ====================================================================
        result = run_article_search_pipeline(
            db=db,
            user_id=user_id,
            days_back=days_back,
            max_results=max_results
        )
        
        # ====================================================================
        # HANDLE RESULTS
        # ====================================================================
        if not result['success']:
            error = result.get('error', 'Unknown error occurred')
            logger.error(f"Article search failed for {user_id}: {error}")
            return jsonify({
                'success': False,
                'error': error
            }), 400 if 'no case file' in error.lower() else 500
        
        logger.info(f"Article search complete: {result['articles_found']} articles found for {user_id}")
        
        response = {
            'success': True,
            'user_id': user_id,
            'articles_found': result['articles_found'],
            'articles': result['articles'],
            'search_query': result['search_query']
        }
        
        if result['articles_found'] == 0:
            response['message'] = 'No recent articles found matching your case terms'
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in search_articles: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500


# ============================================================================
# ROUTE: ANALYZE ARTICLES (STEP 2)
# ============================================================================

@app.route('/api/v1/analyze-articles', methods=['POST'])
def analyze_articles():
    """
    Analyze selected articles against the user's case documents.
    
    This is Step 2 of the two-step workflow. It takes articles selected
    by the user, summarizes them, finds relevant case document chunks,
    performs RAG-based impact analysis, and saves actionable alerts.
    
    Request Headers:
        Authorization (str): Firebase ID token in format "Bearer <token>"
        
    Request Body (JSON):
        {
            "articles": [
                {
                    "title": str,
                    "link": str,
                    "snippet": str
                },
                ...
            ]
        }
        
    Returns:
        JSON response with:
            - success (bool): Whether operation completed successfully
            - user_id (str): Authenticated user's identifier
            - articles_analyzed (int): Number of articles processed
            - alerts_created (int): Number of actionable alerts saved
            - alerts (list): Details of each alert (id, title, priority)
            - message (str, optional): Informational message
            - error (str, optional): Error description if failed
            
    Status Codes:
        - 200 OK: Analysis completed successfully
        - 400 Bad Request: Invalid input or no articles provided
        - 401 Unauthorized: Missing or invalid authentication token
        - 500 Internal Server Error: Unexpected server error
    """
    try:
        # ====================================================================
        # AUTHENTICATION
        # ====================================================================
        logger.info("Received article analysis request")
        
        try:
            user_id = verify_token(request)
        except ValueError as e:
            logger.warning(f"Authentication failed: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 401
        
        logger.info(f"User authenticated: {user_id}")
        
        # ====================================================================
        # PARSE REQUEST
        # ====================================================================
        data = request.json or {}
        articles = data.get('articles', [])
        
        is_valid, error_msg = validate_article_analysis_inputs(user_id, articles)
        if not is_valid:
            logger.warning(f"Invalid analysis request: {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        logger.info(f"Analyzing {len(articles)} articles for {user_id}")
        
        # ====================================================================
        # RUN ANALYSIS PIPELINE
        # ====================================================================
        result = run_article_analysis_pipeline(
            db=db,
            gemini_model=gemini_model,
            embedding_model=embedding_model,
            pinecone_index=pinecone_index,
            user_id=user_id,
            articles=articles
        )
        
        # ====================================================================
        # HANDLE RESULTS
        # ====================================================================
        if not result['success']:
            error = result.get('error', 'Unknown error occurred')
            logger.error(f"Article analysis failed for {user_id}: {error}")
            return jsonify({
                'success': False,
                'error': error
            }), 500
        
        logger.info(f"Analysis complete: {result['alerts_created']} alerts for {user_id}")
        
        response = {
            'success': True,
            'user_id': user_id,
            'articles_analyzed': result['articles_analyzed'],
            'alerts_created': result['alerts_created']
        }
        
        if result['alerts']:
            response['alerts'] = result['alerts']
        
        if result['alerts_created'] == 0 and result['articles_analyzed'] > 0:
            response['message'] = 'Articles analyzed but no significant impacts detected on your case'
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in analyze_articles: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8082))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    logger.info(f"Starting Flask server on port {port} (debug={debug})")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )