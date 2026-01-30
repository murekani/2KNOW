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

# Simple in-memory cache to reduce frequent Google Trends calls
import threading
CACHE_TTL = int(os.getenv('TRENDS_CACHE_TTL', '600'))  # seconds, default 10 minutes
_trends_cache = {}
_cache_lock = threading.Lock()

# Simple metrics for monitoring
_metrics = {
    'cache_hits': 0,
    'cache_misses': 0,
    'retries': 0,
    'rate_limit_hits': 0,
    'fallbacks': 0,
    'regional_queries': 0,
    'regional_success': 0
}

# Retry / backoff settings
MAX_RETRIES = int(os.getenv('TRENDS_MAX_RETRIES', '3'))
BACKOFF_BASE = float(os.getenv('TRENDS_BACKOFF_BASE', '1.0'))


def _get_cached(key):
    with _cache_lock:
        entry = _trends_cache.get(key)
        if not entry:
            _metrics['cache_misses'] += 1
            return None
        ts, data = entry
        if (time.time() - ts) < CACHE_TTL:
            print(f"🔁 Serving cached trends for {key}")
            _metrics['cache_hits'] += 1
            return data
        # expired
        del _trends_cache[key]
        _metrics['cache_misses'] += 1
        return None


def _set_cached(key, data):
    with _cache_lock:
        _trends_cache[key] = (time.time(), data)


def get_historical_trends(keyword: str, country: str = "KE", region: str = "KE", timeframe: str = "today 12-m"):
    """
    Fetch historical Google Trends data for a specific region.
    Uses caching and exponential backoff retries to handle 429s and transient errors.
    Returns demo data if API keys not set or if retries fail.
    """
    if USE_DEMO_DATA:
        print(f"📊 Using demo historical data for: {keyword} in {region}")
        return generate_demo_historical_data(keyword, region=region)

    # Cache key includes region and an indicator that we may bias by region
    cache_key = f"{keyword.lower()}::{region}::{timeframe}::rb"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    # Build a list of keyword variants to try (prefer region-biased query when a region is selected)
    keyword_variants = []
    if region and region != 'KE':
        # Try a query that includes the region to bias results (works where geo codes are limited)
        keyword_variants.append(f"{keyword} {region} Kenya")
    # Always try the plain keyword as fallback
    keyword_variants.append(keyword)

    # Try with retries and exponential backoff across variants
    for attempt in range(1, MAX_RETRIES + 1):
        for kv in keyword_variants:
            try:
                # If using region-biased query, note it in metrics
                if kv != keyword:
                    _metrics['regional_queries'] += 1

                pytrends.build_payload([
                    kv
                ], cat=0, timeframe=timeframe, geo=country, gprop='')

                interest_over_time_df = pytrends.interest_over_time()

                if interest_over_time_df.empty:
                    # if empty, continue to try other variants or retries
                    print(f"No Google Trends data for '{kv}' (region {region}) - empty result")
                    continue

                interest_over_time_df = interest_over_time_df.reset_index()

                historical_data = []
                for _, row in interest_over_time_df.iterrows():
                    # use kv as column if present, otherwise try keyword
                    col_name = kv if kv in interest_over_time_df.columns else keyword
                    value = None
                    try:
                        value = int(row[col_name]) if col_name in row and row[col_name] is not None else None
                    except Exception:
                        # fallback: try the first non-date column
                        cols = [c for c in interest_over_time_df.columns if c != 'date']
                        if cols:
                            try:
                                value = int(row[cols[0]])
                            except Exception:
                                value = None

                    if value and value > 0:
                        historical_data.append({
                            "date": row['date'].strftime('%Y-%m-%d'),
                            "value": value
                        })

                final = historical_data if historical_data else None
                if final:
                    # record that region-bias produced results if kv included region
                    if kv != keyword:
                        _metrics['regional_success'] += 1
                    _set_cached(cache_key, final)
                    return final

            except Exception as e:
                # Detect rate limit / 429-like errors
                err_msg = str(e).lower()
                is_rate_limit = '429' in err_msg or 'too many' in err_msg or 'responseerror' in err_msg
                print(f"⚠️ Google Trends attempt {attempt} failed for '{kv}' in {region}: {e}")

                # Increment retry metrics
                _metrics['retries'] += 1
                if is_rate_limit:
                    _metrics['rate_limit_hits'] += 1

                # If we got a rate limit, break out of kv loop and backoff
                if is_rate_limit:
                    break

        # End of variants loop; if we reach here we will backoff then retry
        if attempt < MAX_RETRIES:
            backoff = BACKOFF_BASE * (2 ** (attempt - 1))
            print(f"⏳ Retrying in {backoff} seconds... (attempt {attempt})")
            time.sleep(backoff)
            continue

        # All retries & variants failed - return demo data
        print(f"❌ Google Trends failed after {MAX_RETRIES} attempts for '{keyword}' in {region}. Returning demo data.")
        _metrics['fallbacks'] += 1
        result = generate_demo_historical_data(keyword, region=region)
        _set_cached(cache_key, result)
        return result


def generate_demo_historical_data(keyword: str, region: str = "KE"):
    """Generate demo historical trends data for a keyword."""
    today = datetime.now()
    historical_data = []
    
    # Region-specific base values (Nairobi has higher search volume)
    region_base_values = {
        "Nairobi": (60, 90),
        "Mombasa": (45, 75),
        "Kisumu": (40, 70),
        "Nakuru": (35, 65),
        "Eldoret": (30, 60),
        "Kisii": (25, 55),
        "Kericho": (25, 55),
        "Meru": (30, 60),
        "KE": (50, 85)
    }
    
    min_val, max_val = region_base_values.get(region, (40, 70))
    
    # Generate 12 months of data
    for i in range(12, 0, -1):
        month_date = today - timedelta(days=30*i)
        
        # Base values for different keywords
        if "maize" in keyword.lower():
            base_value = random.randint(min(60, min_val), min(90, max_val))
        elif "phone" in keyword.lower():
            base_value = random.randint(min(50, min_val), min(80, max_val))
        else:
            base_value = random.randint(min_val, max_val)
        
        # Add some variation
        value = base_value + random.randint(-15, 15)
        value = max(10, min(100, value))  # Keep between 10-100
        
        historical_data.append({
            "date": month_date.strftime('%Y-%m-%d'),
            "value": value
        })
    
    return historical_data


def get_trends_metrics():
    """Return a copy of current trends metrics (for debugging/monitoring)."""
    with _cache_lock:
        return dict(_metrics)