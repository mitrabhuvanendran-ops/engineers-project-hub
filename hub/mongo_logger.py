import os
import datetime

# Attempt to connect to MongoDB Atlas if MONGODB_URI is provided
MONGODB_URI = os.getenv('MONGODB_URI')
_mongo_client = None
_mongo_db = None

if MONGODB_URI:
    try:
        from pymongo import MongoClient
        _mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2500)
        _mongo_db = _mongo_client.get_default_database('engineers_hub')
    except Exception as e:
        print(f"MongoDB connection warning: {e}")
        _mongo_client = None
        _mongo_db = None

# In-memory storage fallback if MongoDB is not connected
_local_chat_logs = []
_local_feedback = []

def log_chat_interaction(session_id, user_message, assistant_response, metadata=None):
    """Stores chat conversations in MongoDB."""
    entry = {
        'session_id': session_id,
        'user_message': user_message,
        'assistant_response': assistant_response,
        'metadata': metadata or {},
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z'
    }

    if _mongo_db is not None:
        try:
            _mongo_db.chat_logs.insert_one(entry)
            return {'success': True, 'storage': 'mongodb'}
        except Exception as e:
            print(f"MongoDB insert error: {e}")

    # Fallback storage
    _local_chat_logs.append(entry)
    if len(_local_chat_logs) > 100:
        _local_chat_logs.pop(0)
    return {'success': True, 'storage': 'local_fallback'}

def log_user_feedback(session_id, rating, comments=None):
    """Stores user feedback in MongoDB."""
    entry = {
        'session_id': session_id,
        'rating': rating,
        'comments': comments or '',
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z'
    }

    if _mongo_db is not None:
        try:
            _mongo_db.feedback.insert_one(entry)
            return {'success': True, 'storage': 'mongodb'}
        except Exception as e:
            print(f"MongoDB feedback insert error: {e}")

    _local_feedback.append(entry)
    if len(_local_feedback) > 100:
        _local_feedback.pop(0)
    return {'success': True, 'storage': 'local_fallback'}

def get_mongo_status():
    """Returns the operational status of MongoDB."""
    if _mongo_db is not None:
        try:
            _mongo_client.admin.command('ping')
            return {'connected': True, 'type': 'MongoDB Atlas Cluster'}
        except Exception as e:
            return {'connected': False, 'type': 'Offline / Error', 'error': str(e)}
    return {'connected': False, 'type': 'Local Logging Fallback (MONGODB_URI not set)'}
