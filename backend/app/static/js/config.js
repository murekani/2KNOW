/**
 * API Configuration
 * Dynamically sets API URL based on environment (local vs production)
 */

// Detect environment and return correct API URL
function getApiUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Production: deployed backend (Railway)
    // If NOT localhost or 127.0.0.1, assume Railway deployment
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Use your deployed backend URL here (Railway)
        return 'https://web-production-c80fe.up.railway.app';
    }

    // Local development
    return 'http://127.0.0.1:8000';
}

// Export API URL constant
const API_URL = getApiUrl();

// Debug log
console.log(`🔌 API Configuration loaded: ${API_URL}`);

// For debugging
console.log('🔌 API Configuration Loaded:', {
  baseUrl: API_URL,
  hostname: window.location.hostname,
  protocol: window.location.protocol
});

// Make available globally
window.API_URL = API_URL;
window.getApiUrl = getApiUrl;

// Export for Node.js modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_URL, getApiUrl };
}