import os
import httpx
from dotenv import load_dotenv
import asyncio
import random
from datetime import datetime, timedelta

load_dotenv()

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

async def get_serper_data(keyword: str, country: str = "ke", region: str = "KE"):
    """
    Fetch real-time search data for a keyword in a specific Kenyan region.
    Returns relevance score and market insights adjusted for the region.
    """
    # Region-specific adjustments for search
    region_queries = {
        "Nairobi": f"{keyword} Nairobi Kenya market",
        "Mombasa": f"{keyword} Mombasa Kenya coast market",
        "Kisumu": f"{keyword} Kisumu Lake Victoria market",
        "Nakuru": f"{keyword} Nakuru Rift Valley market",
        "Eldoret": f"{keyword} Eldoret Kenya market",
        "Kisii": f"{keyword} Kisii Kenya market",
        "Kericho": f"{keyword} Kericho Kenya market",
        "Nyeri": f"{keyword} Nyeri Central Kenya market",
        "Meru": f"{keyword} Meru Kenya market",
        "KE": f"{keyword} market Kenya"
    }
    
    # If no API key, return demo data with region-specific insights
    if not SERPER_API_KEY or SERPER_API_KEY == "not-set-yet":
        print(f"⚠️  SERPER_API_KEY not set. Using demo data for: {keyword} in {region}")
        
        # Region-specific relevance scores
        region_modifiers = {
            "Nairobi": 0.95,
            "Mombasa": 0.85,
            "Kisumu": 0.80,
            "Nakuru": 0.75,
            "Eldoret": 0.70,
            "Kisii": 0.65,
            "Kericho": 0.65,
            "Nyeri": 0.70,
            "Meru": 0.70,
            "KE": 1.0
        }
        
        modifier = region_modifiers.get(region, 0.75)
        
        # Demo relevance score based on keyword
        if "maize" in keyword.lower():
            base_relevance = 75
            market_sector = "Agriculture"
        elif "phone" in keyword.lower():
            base_relevance = 65
            market_sector = "Electronics"
        else:
            base_relevance = random.randint(40, 60)
            market_sector = "General"
        
        relevance_score = base_relevance * modifier
        
        # Region-specific markets
        if region == "Nairobi":
            regions = ["Nairobi", "Thika", "Machakos"]
        elif region == "Mombasa":
            regions = ["Mombasa", "Malindi", "Kilifi"]
        elif region == "Kisumu":
            regions = ["Kisumu", "Siaya", "Kisii"]
        elif region == "Nakuru":
            regions = ["Nakuru", "Naivasha", "Eldoret"]
        elif region == "KE":
            regions = ["Nairobi", "Mombasa", "Kisumu"]
        else:
            regions = [region]
        
        return {
            "relevance_score": relevance_score,
            "market_sector": market_sector,
            "regions": regions,
            "region": region,
            "note": f"Demo data for {region} - Add SERPER_API_KEY in .env for real data"
        }
    
    # REAL API CALL (when you add your key)
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    
    # Bias Serper query by region when provided to get region-specific relevance
    query_text = f"{keyword} market Kenya" if region == 'KE' else f"{keyword} {region} market Kenya"
    payload = {
        "q": query_text,
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