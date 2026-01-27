import os
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import pandas as pd
import time
import random
from dotenv import load_dotenv

load_dotenv()

# Check if we should use demo data
USE_DEMO_DATA = not os.getenv("SERPER_API_KEY") or os.getenv("SERPER_API_KEY") == "not-set-yet"

# Initialize pytrends only if we have real API access
if not USE_DEMO_DATA:
    pytrends = TrendReq(hl='en-US', tz=360, timeout=(10,25), retries=2)

def get_historical_trends(keyword: str, country: str = "KE", timeframe: str = "today 12-m"):
    """
    Fetch historical Google Trends data.
    Returns demo data if API keys not set.
    """
    if USE_DEMO_DATA:
        print(f"📊 Using demo historical data for: {keyword}")
        return generate_demo_historical_data(keyword)
    
    try:
        # REAL Google Trends API call
        pytrends.build_payload(
            [keyword], 
            cat=0, 
            timeframe=timeframe, 
            geo=country, 
            gprop=''
        )
        
        interest_over_time_df = pytrends.interest_over_time()
        
        if interest_over_time_df.empty:
            print(f"No Google Trends data for '{keyword}' in Kenya")
            return generate_demo_historical_data(keyword)
        
        interest_over_time_df = interest_over_time_df.reset_index()
        
        historical_data = []
        for _, row in interest_over_time_df.iterrows():
            if row[keyword] > 0:
                historical_data.append({
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "value": int(row[keyword])
                })
        
        return historical_data if historical_data else generate_demo_historical_data(keyword)
        
    except Exception as e:
        print(f"❌ Google Trends error: {e}")
        return generate_demo_historical_data(keyword)

def generate_demo_historical_data(keyword: str):
    """Generate realistic demo historical data"""
    historical_data = []
    today = datetime.now()
    
    # Generate 12 months of data
    for i in range(12, 0, -1):
        month_date = today - timedelta(days=30*i)
        
        # Base values for different keywords
        if "maize" in keyword.lower():
            base_value = random.randint(60, 90)
        elif "phone" in keyword.lower():
            base_value = random.randint(50, 80)
        else:
            base_value = random.randint(40, 70)
        
        # Add some variation
        value = base_value + random.randint(-15, 15)
        value = max(10, min(100, value))  # Keep between 10-100
        
        historical_data.append({
            "date": month_date.strftime('%Y-%m-%d'),
            "value": value
        })
    
    return historical_data