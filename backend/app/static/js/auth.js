

// ---------- REGISTER ----------
async function registerUser(email, username, password, fullName) {
    try {
        console.log(`📝 Registering user: ${email}`);
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
                full_name: fullName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Registration error:', errorData);
            throw new Error(errorData.detail || 'Registration failed');
        }

        const data = await response.json();
        console.log('✅ Registration successful:', data.user.email);
        
        // Store authentication data
        localStorage.setItem('jwt_token', data.access_token);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_username', data.user.username);
        localStorage.setItem('user_name', data.user.full_name || data.user.username);
        localStorage.setItem('user_id', data.user.id);
        
        if (data.user.created_at) {
            localStorage.setItem('member_since', data.user.created_at);
        }
        if (data.user.last_login) {
            localStorage.setItem('last_login', data.user.last_login);
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// ---------- LOGIN ----------
async function loginUser(email, password) {
    try {
        console.log(`🔐 Logging in: ${email}`);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid email or password');
            } else if (response.status === 400) {
                throw new Error(errorData.detail || 'Invalid request');
            } else {
                throw new Error('Login failed. Please try again.');
            }
        }

        const data = await response.json();
        console.log('✅ Login successful:', data.user.email);
        
        // Store authentication data
        localStorage.setItem('jwt_token', data.access_token);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_username', data.user.username);
        localStorage.setItem('user_name', data.user.full_name || data.user.username);
        localStorage.setItem('user_id', data.user.id);
        
        // Store dates properly
        if (data.user.created_at) {
            localStorage.setItem('member_since', data.user.created_at);
        }
        if (data.user.last_login) {
            localStorage.setItem('last_login', data.user.last_login);
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// ---------- GET USER PROFILE ----------
async function getUserProfile() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.error('❌ No token found');
        return null;
    }

    try {
        console.log('📋 Fetching user profile...');
        
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Profile fetch failed:', response.status);
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('jwt_token');
                throw new Error('Session expired. Please login again.');
            }
            
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch user profile');
        }

        const profile = await response.json();
        console.log('✅ Profile fetched:', profile.email);
        
        // Update localStorage with fresh data
        localStorage.setItem('user_email', profile.email);
        localStorage.setItem('user_username', profile.username);
        localStorage.setItem('user_name', profile.full_name || profile.username);
        localStorage.setItem('user_id', profile.id);
        
        if (profile.created_at) {
            localStorage.setItem('member_since', profile.created_at);
        }
        if (profile.last_login) {
            localStorage.setItem('last_login', profile.last_login);
        }

        return profile;
    } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
    }
}

// ---------- AUTH STATUS ----------
function isAuthenticated() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.log('❌ No token found');
        return false;
    }

    try {
        // Simple token check - in production, you might want to validate with backend
        return !!token;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// ---------- GET AUTH HEADER ----------
function getAuthHeader() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.warn('⚠️ No token available for auth header');
        return {};
    }
    
    return { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

// ---------- LOGOUT ----------
function logout() {
    console.log('👋 Logging out...');
    
    // Clear all auth-related data
    const itemsToRemove = [
        'jwt_token',
        'user_email',
        'user_username',
        'user_name',
        'user_id',
        'member_since',
        'last_login',
        'last_search'
    ];
    
    itemsToRemove.forEach(item => {
        localStorage.removeItem(item);
    });
    
    // Optional: Clear all localStorage except for preferences
    const keepKeys = ['app_theme', 'region_preference'];
    Object.keys(localStorage).forEach(key => {
        if (!keepKeys.includes(key) && !key.startsWith('search_')) {
            localStorage.removeItem(key);
        }
    });
    
    console.log('✅ Logged out, redirecting to login page...');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ---------- LOAD USER INFO ----------
function loadUserInfo() {
    try {
        const name = localStorage.getItem('user_name') || 'User';
        const email = localStorage.getItem('user_email') || '';
        const username = localStorage.getItem('user_username') || '';

        // Update dashboard elements
        const nameEl = document.getElementById('userName');
        const emailEl = document.getElementById('userEmail');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');

        if (nameEl) nameEl.textContent = name;
        if (emailEl) emailEl.textContent = email;
        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = email;
        
        // Update header profile
        const headerUserName = document.getElementById('headerUserName');
        const headerUserEmail = document.getElementById('headerUserEmail');
        
        if (headerUserName) headerUserName.textContent = name;
        if (headerUserEmail) headerUserEmail.textContent = email;
        
        // Update profile picture in header
        const profilePicture = localStorage.getItem('profile_picture');
        if (profilePicture) {
            const headerProfileAvatar = document.getElementById('headerProfileAvatar');
            if (headerProfileAvatar) {
                headerProfileAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        }
        
        // Update member since date
        const memberSince = localStorage.getItem('member_since');
        if (memberSince && document.getElementById('memberSince')) {
            try {
                const date = new Date(memberSince);
                if (!isNaN(date.getTime())) {
                    document.getElementById('memberSince').textContent = 
                        date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                }
            } catch (e) {
                console.error('Error formatting date:', e);
                document.getElementById('memberSince').textContent = 'Recently';
            }
        }
        
        console.log('✅ User info loaded:', email);
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// ---------- CHECK BACKEND HEALTH ----------
async function checkBackendHealth() {
    try {
        console.log('🔌 Checking backend health...');
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        console.log('✅ Backend health:', data.status);
        return data.status === 'ok';
    } catch (error) {
        console.error('❌ Backend health check failed:', error);
        return false;
    }
}

// ---------- INITIALIZE AUTH ----------
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 Auth module initializing...');
    
    // Show current page
    console.log('📄 Current page:', window.location.pathname);
    
    // Redirect logged-in users away from login page
    if (isAuthenticated() && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
        console.log('🔄 Already logged in, redirecting to dashboard...');
        window.location.href = '/app';
        return;
    }

    // Protect dashboard pages
    if (window.location.pathname.includes('/app')) {
        if (!isAuthenticated()) {
            console.log('🚫 Not authenticated, redirecting to login...');
            window.location.href = 'index.html';
            return;
        }
        
        // Load user info on dashboard
        loadUserInfo();
        
        // Optionally fetch fresh user data
        try {
            const profile = await getUserProfile();
            if (profile) {
                console.log('🔄 Refreshed user profile');
                loadUserInfo();
            }
        } catch (error) {
            console.error('Failed to refresh user profile:', error);
        }
    }

    // API status indicator
    const apiStatus = document.getElementById('apiStatus');
    if (apiStatus) {
        try {
            const healthy = await checkBackendHealth();
            apiStatus.innerHTML = healthy
                ? '<i class="fas fa-check-circle"></i> Backend API is connected'
                : '<i class="fas fa-exclamation-triangle"></i> Backend API is not reachable';
            apiStatus.style.color = healthy ? '#10B981' : '#EF4444';
        } catch (error) {
            apiStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> API check failed';
            apiStatus.style.color = '#EF4444';
        }
    }
    
    console.log('✅ Auth module initialized');
});

// ---------- EXPORT FUNCTIONS ----------
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getAuthHeader = getAuthHeader;
window.getUserProfile = getUserProfile;
window.loadUserInfo = loadUserInfo;