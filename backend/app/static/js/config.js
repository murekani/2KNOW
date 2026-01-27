/**
 * API Configuration
 * Dynamically set based on environment
 * Version: 2 (Updated to use template literals in all files)
 */

// Get API URL based on environment
function getApiUrl() {
    // In production (Railway), use current domain
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Railway deployment: use same origin
        const url = `${window.location.protocol}//${window.location.host}`;
        console.log(`✅ Production mode detected. API URL: ${url}`);
        return url;
    }
    
    // Local development
    const localUrl = 'http://127.0.0.1:8000';
    console.log(`🏠 Development mode detected. API URL: ${localUrl}`);
    return localUrl;
}

const API_URL = getApiUrl();

console.log(`🔌 API Configuration loaded: ${API_URL}`);
