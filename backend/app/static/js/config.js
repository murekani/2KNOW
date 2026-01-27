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
