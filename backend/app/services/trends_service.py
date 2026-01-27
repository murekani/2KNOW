from .serper_service import get_serper_data
from .google_trends_service import get_historical_trends
import asyncio

# Market mapping for Kenya
KENYAN_MARKETS = {
    "agriculture": {
        "sectors": ["agriculture", "farming", "agribusiness"],
        "markets": ["Wakulima Market", "Kariakor Market", "Kisumu Market", "Mombasa Market"]
    },
    "electronics": {
        "sectors": ["electronics", "technology", "phones", "computers"],
        "markets": ["Biashara Street", "River Road", "Nyamakima", "Mombasa's Mwembe Tayari"]
    },
    "automotive": {
        "sectors": ["automotive", "vehicles", "cars", "spare parts"],
        "markets": ["Industrial Area", "Mombasa Road", "Kariobangi", "Gikomba"]
    },
    "fashion": {
        "sectors": ["fashion", "clothing", "textiles"],
        "markets": ["Gikomba", "Toi Market", "Muthurwa", "Kisumu's Kibuye"]
    }
}

def classify_keyword(keyword: str):
    """
    Classify keyword into market sector and suggest physical markets.
    """
    keyword_lower = keyword.lower()
    
    # Default values
    sector = "General"
    markets = ["Nairobi CBD", "Mombasa", "Kisumu"]
    
    # Check each category
    for category, data in KENYAN_MARKETS.items():
        for sector_keyword in data["sectors"]:
            if sector_keyword in keyword_lower:
                sector = category.capitalize()
                markets = data["markets"]
                return sector, markets
    
    return sector, markets

async def get_trend_analysis(keyword: str):
    """
    Main function to get complete trend analysis for a keyword.
    """
    print(f"🔍 Analyzing trends for: {keyword}")
    
    # Run both API calls concurrently
    serper_task = get_serper_data(keyword)
    historical_task = asyncio.to_thread(get_historical_trends, keyword)
    
    # Wait for both to complete
    serper_result, historical_data = await asyncio.gather(serper_task, historical_task)
    
    # Classify keyword
    sector, markets = classify_keyword(keyword)
    
    # Use Serper's sector if available, otherwise use our classification
    market_sector = serper_result.get("market_sector", sector)
    
    # Combine regions from Serper with our markets
    serper_regions = serper_result.get("regions", [])
    all_markets = list(set(markets + serper_regions))[:5]  # Max 5 unique markets
    
    # Calculate overall trend score
    live_score = serper_result.get("relevance_score", 0)
    
    # If we have historical data, calculate average
    historical_score = 0
    if historical_data:
        values = [point["value"] for point in historical_data]
        historical_score = sum(values) / len(values)
    
    # Overall score (weighted average)
    overall_score = (live_score * 0.6) + (historical_score * 0.4)
    
    return {
        "keyword": keyword,
        "live_trend_score": round(live_score, 2),
        "historical_trends": historical_data,
        "market_sector": market_sector,
        "relevant_markets": all_markets,
        "overall_score": round(overall_score, 2),
        "data_source": "Serper API + Google Trends",
        "country": "Kenya"
    }
