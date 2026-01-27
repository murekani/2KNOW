import os
import httpx
from dotenv import load_dotenv
import asyncio
import random
from datetime import datetime, timedelta

load_dotenv()

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

async def get_serper_data(keyword: str, country: str = "ke"):
    """
    Fetch real-time search data for a keyword in Kenya.
    Returns relevance score and market insights.
    """
    # If no API key, return demo data with clear warning
    if not SERPER_API_KEY or SERPER_API_KEY == "not-set-yet":
        print(f"⚠️  SERPER_API_KEY not set. Using demo data for: {keyword}")
        
        # Demo relevance score based on keyword
        if "maize" in keyword.lower():
            relevance_score = 75
            market_sector = "Agriculture"
            regions = ["Nairobi", "Nakuru", "Kisumu"]
        elif "phone" in keyword.lower():
            relevance_score = 65
            market_sector = "Electronics"
            regions = ["Nairobi", "Mombasa", "Kisumu"]
        else:
            relevance_score = random.randint(40, 60)
            market_sector = "General"
            regions = ["Nairobi", "Mombasa", "Eldoret"]
        
        return {
            "relevance_score": relevance_score,
            "market_sector": market_sector,
            "regions": regions,
            "note": "Demo data - Add SERPER_API_KEY in .env for real data"
        }
    
    # REAL API CALL (when you add your key)
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        "q": f"{keyword} market Kenya",
        "gl": country,  # Kenya
        "hl": "en"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://google.serper.dev/search",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            organic_results = data.get("organic", [])
            relevance_score = min(len(organic_results) * 10, 100)
            
            # Market sector detection
            market_sector = "General"
            keyword_lower = keyword.lower()
            if "maize" in keyword_lower or "corn" in keyword_lower or "wheat" in keyword_lower:
                market_sector = "Agriculture"
            elif "phone" in keyword_lower or "mobile" in keyword_lower:
                market_sector = "Electronics"
            elif "car" in keyword_lower or "vehicle" in keyword_lower:
                market_sector = "Automotive"
            
            regions = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
            
            return {
                "relevance_score": relevance_score,
                "market_sector": market_sector,
                "regions": regions[:3],
                "serper_data": data
            }
            
    except Exception as e:
        print(f"❌ Serper API error: {e}")
        return {
            "relevance_score": 50,
            "market_sector": "General",
            "regions": ["Nairobi"],
            "error": str(e)
        }