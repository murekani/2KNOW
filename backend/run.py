# backend/run.py - CLEAN VERSION (NO DEMO CREDENTIALS)
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get host and port from environment variables (for Railway deployment)
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    is_production = os.getenv("ENVIRONMENT", "development") == "production"
    
    print("\n" + "="*60)
    print("🚀 Starting 2KNOW Market Trend Predictor API")
    print("="*60)
    print(f"📁 Database: {os.getenv('DATABASE_URL', 'sqlite:///./2know.db')}")
    print(f"🌐 Server running at: {host}:{port}")
    print(f"📚 API Docs: http://{host if host == 'localhost' else 'your-domain'}:{port}/docs")
    print(f"⚙️  Environment: {'PRODUCTION (Railway)' if is_production else 'DEVELOPMENT'}")
    print("\n📋 Available endpoints:")
    print("  GET  /                    - Welcome message")
    print("  GET  /health              - Health check")
    print("  POST /auth/register       - Register user")
    print("  POST /auth/login          - Login user")
    print("  GET  /auth/profile        - User profile")
    print("  GET  /trends/{keyword}    - Public trends")
    print("  GET  /api/trends/{keyword}- Protected trends")
    print("\n🔑 Required in .env:")
    print("  - JWT_SECRET_KEY")
    print("  - SERPER_API_KEY (for real data)")
    print("  - DATABASE_URL (optional, defaults to SQLite)")
    print("\n🔒 Authentication: REAL USERS ONLY")
    print("   • No demo accounts")
    print("   • Real registration required")
    print("   • JWT token authentication")
    print("\n📊 Features:")
    print("   • Real-time market analysis")
    print("   • Kenyan market insights")
    print("   • User search history")
    print("="*60 + "\n")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False if is_production else True,
        log_level="info"
    )