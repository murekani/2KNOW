from .serper_service import get_serper_data
from .google_trends_service import get_historical_trends
import asyncio

# Regional market mapping for Kenya
REGIONAL_MARKETS = {
    "Nairobi": {
        "markets": ["Wakulima Market", "Kariakor Market", "Gikomba Market", "Biashara Street"],
        "coordinates": "-1.2921, 36.8219",
        "main_industries": ["electronics", "general retail", "textiles", "wholesale"]
    },
    "Mombasa": {
        "markets": ["Mwembe Tayari Market", "Old Town Market", "Likoni Market"],
        "coordinates": "-4.0435, 39.6682",
        "main_industries": ["seafood", "spices", "textiles", "tourism"]
    },
    "Kisumu": {
        "markets": ["Kisumu Market", "Kibuye Market", "Oile Lao Market"],
        "coordinates": "-0.1022, 34.7617",
        "main_industries": ["agriculture", "fish", "rice", "vegetables"]
    },
    "Nakuru": {
        "markets": ["Nakuru Main Market", "Kamkunji Market"],
        "coordinates": "-0.3031, 35.8701",
        "main_industries": ["dairy", "cereals", "vegetables", "livestock"]
    },
    "Eldoret": {
        "markets": ["Eldoret Main Market", "Kaiboi Market"],
        "coordinates": "0.5143, 35.2799",
        "main_industries": ["grains", "dairy", "farm produce", "agriculture"]
    },
    "Kisii": {
        "markets": ["Kisii Market", "Kisii Main Market"],
        "coordinates": "-0.6831, 34.7762",
        "main_industries": ["agriculture", "tea", "vegetables", "dairy"]
    },
    "Kericho": {
        "markets": ["Kericho Market", "Tea Town Market"],
        "coordinates": "-0.3636, 35.2833",
        "main_industries": ["tea", "agriculture", "vegetables", "coffee"]
    },
    "Meru": {
        "markets": ["Meru Town Market", "Central Market"],
        "coordinates": "0.0506, 37.6521",
        "main_industries": ["agriculture", "spices", "fruit", "coffee"]
    },
    "KE": {
        "markets": ["Nairobi CBD", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
        "coordinates": "-0.0236, 37.9062",
        "main_industries": ["all sectors"]
    }
}

# Market mapping for keyword classification
KENYAN_MARKETS = {
    "agriculture": {
        "sectors": ["agriculture", "farming", "agribusiness", "maize", "wheat", "rice", "vegetables"],
        "markets": ["Wakulima Market", "Kariakor Market", "Kisumu Market", "Mombasa Market"]
    },
    "electronics": {
        "sectors": ["electronics", "technology", "phones", "computers", "mobile"],
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

def get_region_markets(region: str) -> list:
    """
    Get markets for a specific region.
    """
    if region in REGIONAL_MARKETS:
        return REGIONAL_MARKETS[region]["markets"]
    return REGIONAL_MARKETS["KE"]["markets"]

def filter_markets_by_region(markets: list, region: str) -> list:
    """
    Filter markets to only include those relevant to the region.
    """
    if region == "KE":
        return markets[:5]  # Return top 5 markets for all Kenya
    
    region_markets = get_region_markets(region)
    # Return markets that are in the region's market list
    filtered = [m for m in markets if m in region_markets]
    return filtered if filtered else region_markets[:3]

async def get_trend_analysis(keyword: str, region: str = "KE"):
    """
    Main function to get complete trend analysis for a keyword with regional focus.
    """
    print(f"🔍 Analyzing trends for: {keyword} in {region}")
    
    # Run both API calls concurrently
    serper_task = get_serper_data(keyword, region=region)
    historical_task = asyncio.to_thread(get_historical_trends, keyword, region=region)
    
    # Wait for both to complete
    serper_result, historical_data = await asyncio.gather(serper_task, historical_task)
    
    # Classify keyword
    sector, markets = classify_keyword(keyword)
    
    # Use Serper's sector if available, otherwise use our classification
    market_sector = serper_result.get("market_sector", sector)
    
    # Get region-specific markets
    region_markets = get_region_markets(region)
    
    # Filter markets to region
    relevant_markets = filter_markets_by_region(markets + region_markets, region)
    relevant_markets = list(set(relevant_markets))[:5]  # Max 5 unique markets
    
    # Calculate overall trend score (with region adjustment)
    live_score = serper_result.get("relevance_score", 0)
    
    # If we have historical data, calculate average
    historical_score = 0
    regional_method = {
        'pytrends': 'country',
        'serper': 'query_bias' if region != 'KE' else 'country'
    }

    if historical_data:
        values = [point["value"] for point in historical_data]
        historical_score = sum(values) / len(values)
        # If we had regional-specific historical trends (detected by metrics), mark it
        try:
            from .google_trends_service import _metrics as _gt_metrics
            if _gt_metrics.get('regional_success', 0) > 0 and region != 'KE':
                regional_method['pytrends'] = 'query_bias'
        except Exception:
            pass
    
    # Overall score (weighted average)
    overall_score = (live_score * 0.6) + (historical_score * 0.4)
    
    result = {
        "keyword": keyword,
        "region": region,
        "live_trend_score": round(live_score, 2),
        "historical_trends": historical_data,
        "market_sector": market_sector,
        "relevant_markets": relevant_markets,
        "overall_score": round(overall_score, 2),
        "data_source": "Serper API + Google Trends",
        "country": "Kenya",
        "region_coordinates": REGIONAL_MARKETS.get(region, {}).get("coordinates", "Kenya"),
        "region_handling": regional_method
    }

    return result
