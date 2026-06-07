# Proactive Case Monitoring Agent - Complete File Structure

## 📂 Directory Layout

```
ML/proactive_agent/
│
├── 📁 services/                          # Service modules (business logic)
│   ├── __init__.py                       # Package initialization
│   ├── firebase_service.py               # Firebase Auth & Firestore operations
│   ├── google_service.py                 # Google Search & Gemini Embeddings
│   ├── gemini_service.py                 # Gemini AI prompts (summarization, RAG)
│   ├── pinecone_service.py               # Pinecone vector database operations
│   ├── extraction_service.py             # ⭐ NEW: Legal NER + concept extraction
│   └── pipeline.py                       # Workflow orchestration
│
├── app.py                                # 🚪 Main Flask server (HTTP endpoints)
├── requirements.txt                      # Python dependencies
│
├── .env                                  # 🔒 Environment variables (SECRET)
├── .env.example                          # Template for .env
├── serviceAccountKey.json                # 🔒 Firebase credentials (SECRET)
│
├── .gitignore                            # Git exclusions
├── setup.sh                              # Quick setup script
├── README.md                             # Main documentation
└── FILE_STRUCTURE.md                     # This file
```

## 📝 File Descriptions

### Core Application Files

#### `app.py` (Main Server)
- **Purpose**: Flask web server with HTTP endpoints
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/v1/upload-case-file` - Upload and process case PDF
  - `POST /api/v1/search-articles` - Search web for relevant articles
  - `POST /api/v1/analyze-articles` - Analyze articles against case
- **Responsibilities**: Routing, authentication, error handling

#### `requirements.txt` (Dependencies)
- Flask ecosystem (Flask, flask-cors, gunicorn)
- Firebase Admin SDK
- Google APIs (Search, Gemini)
- Pinecone client
- Transformers (for Legal NER)
- PyTorch (NER model backend)
- PyPDF2 (PDF text extraction)
- LangChain (text chunking)

### Service Modules (services/)

#### `firebase_service.py`
- **Functions**:
  - `initialize_firebase()` - Setup Firebase Admin SDK
  - `verify_token(request)` - Authenticate user from Bearer token
  - `get_profile_from_firestore(db, user_id)` - Fetch user profile
  - `update_profile_metadata(db, user_id, updates)` - Update profile fields
  - `save_alert_to_firestore(db, user_id, alert_data)` - Save alerts
  - `get_user_alerts(db, user_id, ...)` - Retrieve alerts
- **New Schema**: 
  ```json
  {
    "user_id": "...",
    "monitored_doc_name": "case.pdf",
    "doc_upload_limit": 1,
    "doc_upload_count": 0,
    "extracted_search_terms": ["term1", "term2"]
  }
  ```

#### `google_service.py`
- **Functions**:
  - `initialize_google_search()` - Setup Custom Search API
  - `scan_public_sources(service, extracted_terms, ...)` - NEW: OR query search
  - `initialize_gemini_embeddings()` - Setup Gemini embedding model
  - `get_embedding(text, model)` - Generate 768-dim vector
  - `batch_get_embeddings(texts, model)` - Batch embedding generation

#### `gemini_service.py`
- **Functions**:
  - `initialize_gemini_generative_model()` - Setup Gemini 1.5 Flash
  - `summarize_articles(model, articles)` - Legal article summarization
  - `generate_actionable_alert(model, briefing, matches)` - RAG analysis

#### `pinecone_service.py`
- **Functions**:
  - `initialize_pinecone()` - Connect to `private-doc-library` index
  - `upsert_document_chunks(index, chunks)` - NEW: Batch upload chunks
  - `query_pinecone(index, user_id, vector, ...)` - Semantic search
  - `delete_user_documents(index, user_id)` - Cleanup on account deletion

#### `extraction_service.py` ⭐ NEW "BLACK BOX"
- **Functions**:
  - `initialize_legal_ner_model()` - Load OpenNyAI NER model
  - `extract_text_from_pdf(pdf_file)` - PyPDF2 extraction
  - `extract_legal_entities(text, ner_pipeline)` - NER entity extraction
  - `get_legal_concepts(text, gemini_model)` - Gemini concept extraction
  - `run_extraction_pipeline(pdf_file, gemini_model)` - **MAIN FUNCTION**
    - Extracts text
    - Runs NER (14 entity types)
    - Filters to "public pillars" (STATUTE, PRECEDENT, etc.)
    - Extracts 10-15 concepts with Gemini
    - Returns `{full_text, extracted_search_terms}`

#### `pipeline.py`
- **Functions**:
  - `process_case_file_upload(...)` - Complete case file workflow
    1. Check upload limit
    2. Run extraction pipeline
    3. Save terms to Firestore
    4. Chunk document
    5. Generate embeddings
    6. Upload to Pinecone
  - `run_article_analysis_pipeline(...)` - Article analysis workflow
    1. Summarize articles
    2. Generate embeddings
    3. Query Pinecone for relevant chunks
    4. RAG analysis
    5. Save alerts
  - `validate_case_upload_inputs(...)` - Input validation
  - `validate_article_analysis_inputs(...)` - Input validation

### Configuration Files

#### `.env` (Secrets)
```bash
FLASK_ENV=production
PORT=8082
GOOGLE_API_KEY=xxx
GOOGLE_CSE_ID=xxx
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=private-doc-library
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
```

#### `serviceAccountKey.json` (Firebase Credentials)
- Downloaded from Firebase Console
- Contains project credentials
- **NEVER commit to Git**

#### `.gitignore`
- Excludes secrets (.env, serviceAccountKey.json)
- Excludes Python artifacts (__pycache__, *.pyc)
- Excludes model caches

### Documentation Files

#### `README.md`
- Architecture overview
- Setup instructions
- API documentation
- Troubleshooting guide

#### `FILE_STRUCTURE.md` (This file)
- Complete file descriptions
- Module responsibilities
- Data flow diagrams

#### `setup.sh`
- Automated setup script
- Creates virtual environment
- Installs dependencies
- Creates .env template

## 🔄 Data Flow

### Upload Flow
```
PDF File
   ↓
extraction_service.py (Extract text + NER + Concepts)
   ↓
firebase_service.py (Save terms to Firestore)
   ↓
pipeline.py (Chunk + Embed)
   ↓
pinecone_service.py (Index chunks)
```

### Search Flow
```
User Request
   ↓
firebase_service.py (Get extracted_search_terms)
   ↓
google_service.py (Build OR query, search web)
   ↓
Return articles to user
```

### Analysis Flow
```
Selected Articles
   ↓
gemini_service.py (Summarize)
   ↓
google_service.py (Embed summaries)
   ↓
pinecone_service.py (Find relevant case chunks)
   ↓
gemini_service.py (RAG analysis)
   ↓
firebase_service.py (Save alerts)
```

## 🔑 Key Design Decisions

### Separation of Concerns
- **app.py**: Only routing and HTTP handling
- **services/**: All business logic
- **pipeline.py**: Orchestration layer

### Modularity
- Each service is independent
- Can be tested in isolation
- Easy to swap implementations

### Security
- Firebase token authentication
- User-specific data isolation (user_id filter)
- No API keys in code

### Scalability
- Stateless design
- Batch processing for efficiency
- Can add caching layer

## 🚀 Deployment Checklist

- [ ] Python 3.9+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` configured with all keys
- [ ] `serviceAccountKey.json` added
- [ ] Pinecone index `private-doc-library` created (dim=768)
- [ ] Firestore `profiles` collection initialized
- [ ] Google Custom Search Engine set to "entire web"
- [ ] Test endpoints with curl/Postman

## 📊 Metrics to Monitor

- Upload success rate
- Extraction pipeline duration
- Average articles found per search
- Alert generation rate
- API error rates
- Token usage (Gemini, Pinecone)

---

**Last Updated**: 2025-11-08  
**Version**: 1.0.0  
**Status**: Production Ready