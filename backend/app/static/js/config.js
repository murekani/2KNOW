/**
 * API Configuration
 * Dynamically set based on environment
 */

// Get API URL based on environment
function getApiUrl() {
    // In production (Railway), use current domain
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Railway deployment: use same origin
        return `${window.location.protocol}//${window.location.host}`;
    }
    
    // Local development
    return 'http://127.0.0.1:8000';
}

const API_URL = getApiUrl();

console.log(`🔌 API Configuration loaded: ${API_URL}`);
