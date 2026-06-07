# Testing Guide for Proactive Agent

## ✅ File Structure Check

Your files should be organized like this:

```
ML/proactive_agent/
├── app.py
├── requirements.txt
├── .env                          # CREATE THIS
├── serviceAccountKey.json        # GET FROM FIREBASE
│
└── services/
    ├── __init__.py
    ├── firebase_service.py
    ├── google_service.py
    ├── gemini_service.py
    ├── pinecone_service.py
    ├── extraction_service.py
    └── pipeline.py
```

---

## 📋 Pre-Setup Checklist

### 1. **Get Firebase Service Account Key**
```bash
# Steps:
# 1. Go to Firebase Console: https://console.firebase.google.com
# 2. Select your project
# 3. Go to Project Settings (gear icon) → Service Accounts
# 4. Click "Generate New Private Key"
# 5. Save the downloaded JSON file as `serviceAccountKey.json` in the proactive_agent folder
```

### 2. **Create Google Custom Search Engine**
```bash
# Steps:
# 1. Go to: https://programmablesearchengine.google.com/
# 2. Click "Add" to create a new search engine
# 3. Under "Sites to search": Select "Search the entire web"
# 4. Create and copy the "Search engine ID" (looks like: 1234567890abcdef:xyz)
# 5. Paste it in .env as GOOGLE_CSE_ID
```

### 3. **Create Pinecone Index**
```bash
# Steps:
# 1. Go to: https://app.pinecone.io/
# 2. Create a new index with these settings:
#    - Name: lawyer-documents
#    - Dimensions: 768
#    - Metric: cosine
#    - Cloud: AWS (or your preference)
#    - Region: us-east-1 (or closest to you)
# 3. Copy the API key from the dashboard
```

### 4. **Get Google API Key (Gemini)**
```bash
# Steps:
# 1. Go to: https://makersuite.google.com/app/apikey
# 2. Create API key (or use existing one)
# 3. This same key works for both Gemini and Custom Search
```

---

## 🚀 Setup Steps

### Step 1: Navigate to the project directory
```bash
cd ML/proactive_agent
```

### Step 2: Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: First installation will take 5-10 minutes because:
- PyTorch is large (~800MB)
- Transformers will download the Legal NER model (~400MB) on first run

### Step 4: Create `.env` file
```bash
# Copy the structure from the .env artifact and fill in your actual values
nano .env  # or use any text editor
```

### Step 5: Add `serviceAccountKey.json`
```bash
# Place the Firebase service account key file in the root directory
# Make sure it's named exactly: serviceAccountKey.json
```

### Step 6: Verify file permissions
```bash
chmod 600 serviceAccountKey.json  # Secure the credentials file
chmod 600 .env                     # Secure the environment variables
```

---

## 🧪 Testing Without Frontend

### Method 1: Using cURL

#### Test 1: Health Check
```bash
curl http://localhost:8082/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "proactive-case-monitoring-agent",
  "timestamp": "2025-11-08T12:34:56Z"
}
```

#### Test 2: Upload Case File
```bash
# First, get a Firebase ID token from your frontend or Firebase Auth
# For now, let's assume you have a token in a variable

TOKEN="your_firebase_id_token_here"

curl -X POST http://localhost:8082/api/v1/upload-case-file \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/test_case.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "user_id": "abc123...",
  "doc_name": "test_case.pdf",
  "extracted_terms_count": 25,
  "chunks_indexed": 45,
  "extracted_terms": ["Section 498A IPC", "Supreme Court", ...]
}
```

#### Test 3: Search Articles
```bash
curl -X POST http://localhost:8082/api/v1/search-articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days_back": 7,
    "max_results": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user_id": "abc123...",
  "articles_found": 8,
  "articles": [
    {
      "title": "New Supreme Court ruling on...",
      "link": "https://...",
      "snippet": "..."
    }
  ],
  "search_query": "\"Section 498A IPC\" OR \"Supreme Court\" OR ..."
}
```

#### Test 4: Analyze Articles
```bash
curl -X POST http://localhost:8082/api/v1/analyze-articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [
      {
        "title": "Article title",
        "link": "https://example.com/article",
        "snippet": "Article preview text..."
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user_id": "abc123...",
  "articles_analyzed": 1,
  "alerts_created": 1,
  "alerts": [
    {
      "alert_id": "xyz789...",
      "title": "Article title",
      "priority": "medium",
      "related_docs_count": 2
    }
  ]
}
```

---

### Method 2: Using Postman

1. **Download Postman**: https://www.postman.com/downloads/

2. **Create a new Collection** named "Proactive Agent"

3. **Add these requests:**

#### Request 1: Health Check
- Method: `GET`
- URL: `http://localhost:8082/health`
- No headers or body needed

#### Request 2: Upload Case File
- Method: `POST`
- URL: `http://localhost:8082/api/v1/upload-case-file`
- Headers:
  - `Authorization`: `Bearer YOUR_FIREBASE_TOKEN`
- Body (form-data):
  - Key: `file`, Type: `File`, Value: Select a PDF file

#### Request 3: Search Articles
- Method: `POST`
- URL: `http://localhost:8082/api/v1/search-articles`
- Headers:
  - `Authorization`: `Bearer YOUR_FIREBASE_TOKEN`
  - `Content-Type`: `application/json`
- Body (raw JSON):
```json
{
  "days_back": 7,
  "max_results": 10
}
```

#### Request 4: Analyze Articles
- Method: `POST`
- URL: `http://localhost:8082/api/v1/analyze-articles`
- Headers:
  - `Authorization`: `Bearer YOUR_FIREBASE_TOKEN`
  - `Content-Type`: `application/json`
- Body (raw JSON):
```json
{
  "articles": [
    {
      "title": "Test Article",
      "link": "https://example.com/article",
      "snippet": "This is a test article about legal matters..."
    }
  ]
}
```

---

## 🔐 Getting Firebase ID Token (For Testing)

### Option 1: Use Firebase Auth REST API
```bash
# If you have email/password auth set up:
curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_WEB_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "returnSecureToken": true
  }'

# Extract the "idToken" from the response
```

### Option 2: Use Firebase Console (Temporary)
```bash
# For quick testing, you can temporarily modify app.py to skip auth:
# Comment out the verify_token() calls and hardcode a user_id
# DON'T DO THIS IN PRODUCTION!
```

### Option 3: Create a Simple Test Script
```python
# test_auth.py
import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Create a custom token for testing
uid = 'test_user_123'
custom_token = auth.create_custom_token(uid)
print(f"Custom Token: {custom_token.decode()}")

# Then use this token to get an ID token via Firebase REST API
```

---

## 🏃 Running the Server

### Start the server:
```bash
python app.py
```

**Expected Output:**
```
[2025-11-08 12:00:00] __main__ INFO: Initializing Proactive Case Monitoring Agent...
[2025-11-08 12:00:01] services.firebase_service INFO: Firebase Admin SDK initialized successfully
[2025-11-08 12:00:01] services.google_service INFO: Google Custom Search API initialized successfully
[2025-11-08 12:00:02] services.gemini_service INFO: Gemini generative model initialized: gemini-1.5-flash
[2025-11-08 12:00:02] services.google_service INFO: Gemini embeddings initialized: models/embedding-001
[2025-11-08 12:00:03] services.pinecone_service INFO: Connected to Pinecone index: lawyer-documents
[2025-11-08 12:00:10] services.extraction_service INFO: Legal NER model loaded successfully
[2025-11-08 12:00:10] __main__ INFO: === All services initialized successfully ===
[2025-11-08 12:00:10] __main__ INFO: Starting Flask server on port 8082 (debug=True)
 * Serving Flask app 'app'
 * Running on http://0.0.0.0:8082
```

**Note**: First startup takes longer (~30 seconds) because:
- Legal NER model is downloaded (~400MB)
- Transformers cache is initialized

---

## 🐛 Common Issues & Solutions

### Issue 1: "No module named 'services'"
```bash
# Solution: Make sure you're in the proactive_agent directory
cd ML/proactive_agent
python app.py
```

### Issue 2: "GOOGLE_API_KEY environment variable is required"
```bash
# Solution: Check your .env file exists and has the correct values
cat .env
```

### Issue 3: "Failed to initialize Pinecone"
```bash
# Solution: Verify your Pinecone index exists and API key is correct
# Check index name matches exactly (case-sensitive)
```

### Issue 4: "Firebase initialization failed"
```bash
# Solution: Ensure serviceAccountKey.json is in the correct location
ls -la serviceAccountKey.json
```

### Issue 5: Port 8082 already in use
```bash
# Solution: Change PORT in .env to a different number (e.g., 8083)
# Or kill the process using the port:
lsof -ti:8082 | xargs kill -9
```

### Issue 6: Torch/CUDA warnings
```bash
# These are normal if you don't have a GPU:
# "UserWarning: Using CPU for inference"
# The app will work fine, just slower for NER
```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] `.env` file created with all values filled
- [ ] `serviceAccountKey.json` exists in root directory
- [ ] Virtual environment activated (`venv`)
- [ ] All dependencies installed (`pip list` shows transformers, torch, etc.)
- [ ] Pinecone index created (name: `lawyer-documents`, dim: 768)
- [ ] Google Custom Search Engine created (searches entire web)
- [ ] Firebase project has Firestore enabled
- [ ] Port 8082 is available

---

## 📊 Expected First Run Timeline

| Step | Duration | Notes |
|------|----------|-------|
| Install dependencies | 3-5 min | PyTorch is large |
| First server startup | 30-45 sec | NER model download |
| Health check | < 1 sec | Instant |
| Upload case file | 15-30 sec | NER + extraction |
| Search articles | 3-5 sec | Google API call |
| Analyze articles | 10-20 sec | Per article (Gemini + RAG) |

---

## 🎯 Success Criteria

Your setup is working correctly if:

1. ✅ Server starts without errors
2. ✅ Health check returns status "healthy"
3. ✅ Can upload PDF and get extracted terms
4. ✅ Search returns recent articles
5. ✅ Analysis creates alerts in Firestore

---

## 📝 Next Steps After Testing

Once backend is working:

1. **Create Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /alerts/{alertId} {
      allow read, write: if request.auth != null && 
                          resource.data.user_id == request.auth.uid;
    }
  }
}
```

2. **Add Frontend Integration**
3. **Set up monitoring/logging**
4. **Deploy to production** (Cloud Run, Heroku, etc.)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs in terminal (very verbose)
2. Verify all environment variables are set
3. Test each service independently
4. Check Firestore, Pinecone dashboards for data

Good luck testing! 🚀