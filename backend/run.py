import uvicorn
import os
import sys

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    # Get port from Railway environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    # Run the FastAPI app
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Important for Railway - binds to all network interfaces
        port=port,
        reload=False,  # Set to False for production
        log_level="info"
    )