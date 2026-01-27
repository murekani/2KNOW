
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import traceback

# Import our modules
from . import models
from .database import engine, get_db, SessionLocal
from .auth import create_jwt_token, verify_jwt_token, hash_password, verify_password
from .services.trends_service import get_trend_analysis

# Import Pydantic models
from pydantic import BaseModel

# Create database tables
print("📊 Creating database tables...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
except Exception as e:
    print(f"❌ Error creating tables: {e}")

# Security scheme for JWT tokens
security = HTTPBearer()

app = FastAPI(
    title="2KNOW Market Trend Predictor",
    description="Real-time market trend analysis for Kenya",
    version="1.0.0"
)

# Allow frontend to call backend
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "2KNOW API", "timestamp": datetime.utcnow().isoformat()}

# Mount static files for frontend CSS/JS/Assets
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_path):
    if os.path.isdir(os.path.join(static_path, "css")):
        app.mount("/css", StaticFiles(directory=os.path.join(static_path, "css")), name="css")
    if os.path.isdir(os.path.join(static_path, "js")):
        app.mount("/js", StaticFiles(directory=os.path.join(static_path, "js")), name="js")
    if os.path.isdir(os.path.join(static_path, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_path, "assets")), name="assets")

# Pydantic models for request/response
class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Get current user from JWT token
    """
    token = credentials.credentials
    
    # Verify the token
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    """Get current active user"""
    # You can add additional checks here if needed
    return current_user

# Root endpoint - serve frontend
@app.get("/", response_class=FileResponse)
def read_root():
    static_path = os.path.join(os.path.dirname(__file__), "static")
    index_file = os.path.join(static_path, "index.html")
    if os.path.exists(index_file):
        return index_file
    return {"message": "Welcome to 2KNOW API"}

@app.get("/app", response_class=FileResponse)
def serve_app():
    static_path = os.path.join(os.path.dirname(__file__), "static")
    dashboard_file = os.path.join(static_path, "dashboard.html")
    if os.path.exists(dashboard_file):
        return dashboard_file
    return {"error": "Dashboard not found"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "2KNOW API", "timestamp": datetime.utcnow().isoformat()}

@app.post("/auth/register")
async def register(user: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    print(f"👤 Registration attempt for: {user.email}")
    
    # Validation
    if not user.email or not user.email.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    if not user.username or not user.username.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required"
        )
    
    if not user.password or len(user.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    
    # Basic email validation
    if "@" not in user.email or "." not in user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check if user exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user.email:
            detail = "Email already registered"
        else:
            detail = "Username already taken"
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
    
    try:
        # Create new user with hashed password
        new_user = models.User(
            email=user.email.strip().lower(),
            username=user.username.strip(),
            password_hash=hash_password(user.password),
            full_name=user.full_name.strip() if user.full_name else ""
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create JWT token
        token = create_jwt_token({"user_id": new_user.id, "email": new_user.email})
        
        print(f"✅ User registered successfully: {user.email} (ID: {new_user.id})")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "username": new_user.username,
                "full_name": new_user.full_name,
                "created_at": new_user.created_at,
                "last_login": new_user.last_login
            }
        }
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed. Please try again."
        )

# Login user - REAL LOGIN, NO DEMO
@app.post("/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    """
    print(f"🔐 Login attempt for: {user.email}")
    
    if not user.email or not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    try:
        # Find user (case-insensitive email search)
        db_user = db.query(models.User).filter(
            models.User.email.ilike(user.email.strip())
        ).first()
        
        if not db_user:
            print(f"❌ User not found: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password using the verify_password function
        if not verify_password(user.password, db_user.password_hash):
            print(f"❌ Invalid password for: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login
        db_user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
        
        # Create JWT token
        token = create_jwt_token({"user_id": db_user.id, "email": db_user.email})
        
        print(f"✅ User logged in successfully: {user.email}")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username,
                "full_name": db_user.full_name,
                "created_at": db_user.created_at,
                "last_login": db_user.last_login
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed. Please try again."
        )

# Get current user profile - FIXED VERSION
@app.get("/auth/profile", response_model=UserProfile)
async def get_profile(current_user: models.User = Depends(get_current_active_user)):
    """
    Get current user profile (requires valid JWT token)
    """
    print(f"📊 Profile request for: {current_user.email}")
    
    # Return the user profile with all required fields
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name or "",
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }

# Update user profile
@app.put("/auth/profile")
async def update_profile(
    update_data: dict,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile
    """
    try:
        # Update allowed fields
        if "full_name" in update_data:
            current_user.full_name = update_data["full_name"]
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "username": current_user.username,
                "full_name": current_user.full_name,
                "created_at": current_user.created_at,
                "last_login": current_user.last_login
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Change password
@app.post("/auth/change-password")
async def change_password(
    password_data: dict,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    try:
        current_password = password_data.get("current_password")
        new_password = password_data.get("new_password")
        
        if not current_password or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password and new password are required"
            )
        
        # Verify current password
        if not verify_password(current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        current_user.password_hash = hash_password(new_password)
        db.commit()
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

# Public trends endpoint (no auth required)
@app.get("/trends/{keyword}")
async def get_public_trends(keyword: str):
    """
    Public endpoint for trend analysis
    """
    try:
        print(f"🔍 Analyzing trends for: {keyword}")
        result = await get_trend_analysis(keyword)
        return result
    except Exception as e:
        print(f"❌ Error analyzing trends: {e}")
        # Return demo data for testing if real API fails
        return {
            "keyword": keyword,
            "live_trend_score": 75,
            "historical_trends": [
                {"date": "2024-01", "value": 65},
                {"date": "2024-02", "value": 70},
                {"date": "2024-03", "value": 68},
                {"date": "2024-04", "value": 75},
                {"date": "2024-05", "value": 80},
                {"date": "2024-06", "value": 78}
            ],
            "market_sector": "Agriculture" if "maize" in keyword.lower() else "Electronics" if "phone" in keyword.lower() else "General",
            "relevant_markets": ["Nairobi Market", "Mombasa", "Kisumu"],
            "overall_score": 75,
            "data_source": "Demo Data",
            "country": "Kenya"
        }

# Protected trends endpoint (requires JWT)
@app.get("/api/trends/{keyword}")
async def get_protected_trends(
    keyword: str,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Protected endpoint - requires valid JWT token
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    try:
        result = await get_trend_analysis(keyword)
        result["user"] = current_user.email
        result["user_id"] = current_user.id
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing trends: {str(e)}"
        )

# Debug endpoint to see all users
@app.get("/debug/users")
async def get_users(db: Session = Depends(get_db)):
    """Debug endpoint to see all users"""
    users = db.query(models.User).all()
    return {
        "count": len(users),
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None
            }
            for u in users
        ]
    }

# Test database connection
@app.get("/test/db")
async def test_db(db: Session = Depends(get_db)):
    """Test database connection"""
    try:
        count = db.query(models.User).count()
        return {
            "connected": True,
            "user_count": count,
            "database": str(db.bind.url) if db.bind else "unknown"
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}

# Clean up any existing demo user
@app.delete("/cleanup/demo")
async def cleanup_demo(db: Session = Depends(get_db)):
    """Remove demo user if exists"""
    try:
        demo_user = db.query(models.User).filter(
            models.User.email == "demo@2know.com"
        ).first()
        
        if demo_user:
            db.delete(demo_user)
            db.commit()
            return {"deleted": True, "email": "demo@2know.com"}
        return {"deleted": False, "message": "Demo user not found"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Logout endpoint (invalidate token on frontend)
@app.post("/auth/logout")
async def logout():
    """Logout user (client-side token invalidation)"""
    return {
        "message": "Logged out successfully",
        "note": "Token invalidation should be handled on the client side"
    }

# User statistics
@app.get("/auth/stats")
async def get_user_stats(current_user: models.User = Depends(get_current_active_user)):
    """Get user statistics"""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "account_created": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "member_for_days": (datetime.utcnow() - current_user.created_at).days if current_user.created_at else 0,
        "is_active": True
    }

# ============ DEPLOYMENT COMPLETE ============
