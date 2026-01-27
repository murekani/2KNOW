import os
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import hashlib
import secrets

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "2know-kenya-market-2025-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_DAYS = 30  # Token valid for 30 days

def create_jwt_token(data: dict):
    """Create JWT token for user"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_jwt_token(token: str):
    """Verify JWT token from request"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def hash_password(password: str) -> str:
    """
    Hash password with salt and pepper for security
    Returns: "hash:salt" format
    """
    # Generate a random salt
    salt = secrets.token_hex(16)
    
    # Use pepper from environment or default
    pepper = os.getenv("PASSWORD_PEPPER", "2know-market-kenya-2025-pepper")
    
    # Combine and hash
    combined = password + pepper + salt
    hashed = hashlib.sha256(combined.encode()).hexdigest()
    
    # Return hash and salt separated by colon
    return f"{hashed}:{salt}"

def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify password against stored hash
    stored_hash format: "hash:salt"
    """
    if not stored_hash or ":" not in stored_hash:
        return False
    
    # Extract hash and salt
    hashed, salt = stored_hash.split(":", 1)
    
    # Use same pepper
    pepper = os.getenv("PASSWORD_PEPPER", "2know-market-kenya-2025-pepper")
    
    # Recreate hash
    combined = password + pepper + salt
    new_hash = hashlib.sha256(combined.encode()).hexdigest()
    
    # Compare
    return new_hash == hashed