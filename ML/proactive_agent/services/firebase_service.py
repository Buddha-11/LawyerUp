"""
Firebase Service Module - Refined for Case Monitoring

This module handles all Firebase-related operations with the new schema:
- User authentication via ID token verification
- Firestore operations for profiles (with extracted_search_terms)
- Alert storage and retrieval
"""

import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# FIREBASE INITIALIZATION
# ============================================================================

def initialize_firebase():
    """
    Initialize Firebase Admin SDK with service account credentials.
    
    Returns:
        firestore.Client: Firestore database client
        
    Raises:
        Exception: If Firebase initialization fails
    """
    try:
        credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
        
        if not firebase_admin._apps:
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        
        db = firestore.client()
        logger.info("Firestore client created")
        
        return db
        
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        raise


# ============================================================================
# AUTHENTICATION
# ============================================================================

def verify_token(request):
    return "test_user_local"
    # """
    # Verify Firebase ID token from Authorization header.
    
    # Args:
    #     request (flask.Request): Flask request with headers
        
    # Returns:
    #     str: Authenticated user's unique ID (uid)
        
    # Raises:
    #     ValueError: If token is missing, malformed, or invalid
    # """
    # auth_header = request.headers.get('Authorization')
    
    # if not auth_header:
    #     raise ValueError("Missing Authorization header")
    
    # if not auth_header.startswith('Bearer '):
    #     raise ValueError("Authorization header must be in format: Bearer <token>")
    
    # id_token = auth_header.split('Bearer ')[1].strip()
    
    # try:
    #     decoded_token = auth.verify_id_token(id_token)
    #     user_id = decoded_token['uid']
        
    #     logger.info(f"User authenticated: {user_id}")
    #     return user_id
        
    # except auth.InvalidIdTokenError:
    #     logger.error("Invalid ID token")
    #     raise ValueError("Invalid authentication token")
    # except auth.ExpiredIdTokenError:
    #     logger.error("Expired ID token")
    #     raise ValueError("Authentication token has expired")
    # except Exception as e:
    #     logger.error(f"Token verification failed: {e}")
    #     raise ValueError(f"Authentication failed: {str(e)}")


# ============================================================================
# FIRESTORE OPERATIONS - PROFILES (NEW SCHEMA)
# ============================================================================

def get_profile_from_firestore(db, user_id):
    """
    Fetch lawyer's profile from Firestore.
    
    New schema includes:
    - monitored_doc_name: Name of uploaded case file
    - extracted_search_terms: Auto-extracted legal entities/concepts
    - doc_upload_limit: Maximum documents allowed
    - doc_upload_count: Current number uploaded
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        
    Returns:
        dict: Profile containing:
            - user_id (str)
            - monitored_doc_name (str)
            - extracted_search_terms (list)
            - doc_upload_limit (int)
            - doc_upload_count (int)
            - last_updated (datetime)
            
    Raises:
        ValueError: If profile doesn't exist
    """
    try:
        profile_ref = db.collection('profiles').document(user_id)
        profile_doc = profile_ref.get()
        
        if not profile_doc.exists:
            logger.warning(f"No profile found for user: {user_id}, creating default profile")
            create_default_profile(db, user_id)
            # Fetch the newly created profile
            profile_doc = profile_ref.get()
        
        profile = profile_doc.to_dict()
        profile['user_id'] = user_id
        
        logger.info(f"Profile retrieved for {user_id}")
        return profile
        
    except Exception as e:
        logger.error(f"Failed to fetch profile for {user_id}: {e}")
        raise


def update_profile_metadata(db, user_id, updates):
    """
    Update specific fields in user's profile.
    
    Used to save extracted search terms, update upload count, etc.
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        updates (dict): Fields to update (e.g., {'extracted_search_terms': [...]})
        
    Returns:
        None
        
    Raises:
        Exception: If Firestore update fails
    """
    try:
        updates['last_updated'] = firestore.SERVER_TIMESTAMP
        
        db.collection('profiles').document(user_id).update(updates)
        
        logger.info(f"Profile updated for {user_id}: {list(updates.keys())}")
        
    except Exception as e:
        logger.error(f"Failed to update profile for {user_id}: {e}")
        raise


def create_default_profile(db, user_id):
    """
    Create a default profile for new users.
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        
    Returns:
        None
    """
    try:
        default_profile = {
            'user_id': user_id,
            'monitored_doc_name': None,
            'doc_upload_limit': 1,
            'doc_upload_count': 0,
            'extracted_search_terms': [],
            'created_at': firestore.SERVER_TIMESTAMP,
            'last_updated': firestore.SERVER_TIMESTAMP
        }
        
        db.collection('profiles').document(user_id).set(default_profile)
        
        logger.info(f"Default profile created for {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to create profile for {user_id}: {e}")
        raise


# ============================================================================
# FIRESTORE OPERATIONS - ALERTS
# ============================================================================

def save_alert_to_firestore(db, user_id, alert_data):
    """
    Save a generated alert to Firestore.
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        alert_data (dict): Alert information containing:
            - title (str)
            - article_link (str)
            - summary (str)
            - impact_analysis (str)
            - related_documents (list)
            - priority (str)
            
    Returns:
        str: Document ID of the created alert
        
    Raises:
        Exception: If Firestore write fails
    """
    try:
        full_alert_data = {
            **alert_data,
            'user_id': user_id,
            'status': 'unread',
            'created_at': firestore.SERVER_TIMESTAMP,
            'read_at': None
        }
        
        alert_ref = db.collection('alerts').add(full_alert_data)
        alert_id = alert_ref[1].id
        
        logger.info(f"Alert saved: {alert_id} for user: {user_id}")
        return alert_id
        
    except Exception as e:
        logger.error(f"Failed to save alert for {user_id}: {e}")
        raise


def get_user_alerts(db, user_id, status=None, limit=50):
    """
    Retrieve alerts for a specific user.
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        status (str, optional): Filter by 'read' or 'unread'
        limit (int, optional): Maximum alerts to return
        
    Returns:
        list: List of alert dictionaries
    """
    try:
        query = db.collection('alerts').where('user_id', '==', user_id)
        
        if status:
            query = query.where('status', '==', status)
        
        query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
        
        docs = query.stream()
        alerts = []
        
        for doc in docs:
            alert = doc.to_dict()
            alert['alert_id'] = doc.id
            alerts.append(alert)
        
        logger.info(f"Retrieved {len(alerts)} alerts for user: {user_id}")
        return alerts
        
    except Exception as e:
        logger.error(f"Failed to retrieve alerts for {user_id}: {e}")
        return []


def mark_alert_as_read(db, user_id, alert_id):
    """
    Mark an alert as read.
    
    Args:
        db (firestore.Client): Firestore database client
        user_id (str): Unique identifier of the lawyer
        alert_id (str): Alert document ID
        
    Returns:
        bool: True if successful
    """
    try:
        db.collection('alerts').document(alert_id).update({
            'status': 'read',
            'read_at': firestore.SERVER_TIMESTAMP
        })
        
        logger.info(f"Alert {alert_id} marked as read for {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to mark alert as read: {e}")
        return False