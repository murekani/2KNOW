/**
 * API Configuration for Railway Deployment
 * Use relative URLs since frontend and backend are served from same origin
 */

// For Railway deployment - use relative URLs
const API_CONFIG = {
  // Empty string means relative to current origin
  API_BASE_URL: '',
  
  // Endpoints - these will be appended to API_BASE_URL
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
    trends: '/api/trends',
    publicTrends: '/trends',
    health: '/health',
    logout: '/auth/logout'
  }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  // Remove leading slash if present in endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Return full URL
  return `${API_CONFIG.API_BASE_URL}/${cleanEndpoint}`;
}

// For debugging
console.log('🔌 API Configuration Loaded:', {
  baseUrl: API_CONFIG.API_BASE_URL || 'current origin',
  fullHealthUrl: getApiUrl('health'),
  hostname: window.location.hostname,
  protocol: window.location.protocol
});

// Make available globally
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl;

// Export for Node.js modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, getApiUrl };
}