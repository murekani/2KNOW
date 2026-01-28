// Theme Management System for 2KNOW

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupThemeListener();
});

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    applyTheme(savedTheme);
    
    // Update the theme selector if it exists
    const themeSelector = document.getElementById('themeSetting');
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }
}

// Apply theme to the entire application
function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    html.classList.remove('light-theme', 'dark-theme', 'auto-theme', 'purple-theme', 'ocean-theme', 'forest-theme', 'sunset-theme');
    body.classList.remove('light-theme', 'dark-theme', 'auto-theme', 'purple-theme', 'ocean-theme', 'forest-theme', 'sunset-theme');
    
    // Remove any inline theme styles
    html.removeAttribute('data-theme');
    
    if (theme === 'light') {
        html.setAttribute('data-theme', 'light');
        html.classList.add('light-theme');
        body.classList.add('light-theme');
        applyLightTheme();
    } else if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        html.classList.add('dark-theme');
        body.classList.add('dark-theme');
        applyDarkTheme();
    } else if (theme === 'purple') {
        html.setAttribute('data-theme', 'purple');
        html.classList.add('purple-theme');
        body.classList.add('purple-theme');
        applyPurpleTheme();
    } else if (theme === 'ocean') {
        html.setAttribute('data-theme', 'ocean');
        html.classList.add('ocean-theme');
        body.classList.add('ocean-theme');
        applyOceanTheme();
    } else if (theme === 'forest') {
        html.setAttribute('data-theme', 'forest');
        html.classList.add('forest-theme');
        body.classList.add('forest-theme');
        applyForestTheme();
    } else if (theme === 'sunset') {
        html.setAttribute('data-theme', 'sunset');
        html.classList.add('sunset-theme');
        body.classList.add('sunset-theme');
        applySunsetTheme();
    } else if (theme === 'auto') {
        html.setAttribute('data-theme', 'auto');
        html.classList.add('auto-theme');
        body.classList.add('auto-theme');
        applyAutoTheme();
    }
    
    // Save preference
    localStorage.setItem('app_theme', theme);
}

// Apply light theme styles
function applyLightTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    // Remove other theme stylesheets
    removeThemeStylesheets();
    
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1f2937';
}

// Apply dark theme styles
function applyDarkTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'dark';
    
    removeThemeStylesheets();
    applyDarkModeStyles();
}

// Apply auto theme based on system preference
function applyAutoTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('app_theme') === 'auto') {
                if (e.matches) {
                    applyDarkTheme();
                } else {
                    applyLightTheme();
                }
            }
        });
    }
}

// Apply comprehensive dark mode styles
function applyDarkModeStyles() {
    const styles = `
        body, html {
            background-color: #1f2937 !important;
            color: #f3f4f6 !important;
        }
        
        .sidebar {
            background: #111827 !important;
        }
        
        .header {
            background: #374151 !important;
            border-bottom-color: #4b5563 !important;
        }
        
        .header-title h1 {
            color: #f3f4f6 !important;
        }
        
        .header-title .subtitle {
            color: #d1d5db !important;
        }
        
        .search-box {
            background: #374151 !important;
            border-color: #4b5563 !important;
        }
        
        .search-box input {
            background: transparent !important;
            color: #f3f4f6 !important;
        }
        
        .search-box input::placeholder {
            color: #9ca3af !important;
        }
        
        .search-box button {
            background: #4f46e5 !important;
        }
        
        .date-display {
            background: #374151 !important;
            color: #d1d5db !important;
        }
        
        .region-selector select {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
            color: #f3f4f6 !important;
        }
        
        .header-icon-btn {
            background: #374151 !important;
            color: #d1d5db !important;
        }
        
        .header-icon-btn:hover {
            background: #4f46e5 !important;
            color: white !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container, .quick-analyze-card, .ai-analyze-card,
        .predictions, .recommendations {
            background: #374151 !important;
            border-color: #4b5563 !important;
            color: #f3f4f6 !important;
        }
        
        .stat-card:hover {
            border-color: #818cf8 !important;
        }
        
        .tag, .market-tag {
            background: #4b5563 !important;
            border-color: #6b7280 !important;
            color: #f3f4f6 !important;
        }
        
        .tag:hover {
            background: #4f46e5 !important;
        }
        
        .modal-content {
            background: #374151 !important;
            color: #f3f4f6 !important;
        }
        
        .modal-header {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
        }
        
        .modal-body {
            background: #374151 !important;
        }
        
        .modal-footer {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
        }
        
        .form-input {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
            color: #f3f4f6 !important;
        }
        
        .form-input::placeholder {
            color: #9ca3af !important;
        }
        
        .btn-secondary {
            background: #4b5563 !important;
            border-color: #6b7280 !important;
            color: #f3f4f6 !important;
        }
        
        .btn-secondary:hover {
            background: #6b7280 !important;
        }
        
        .empty-state {
            color: #9ca3af !important;
        }
        
        .settings-tab-content h3 {
            color: #f3f4f6 !important;
        }
        
        .setting-item label {
            color: #f3f4f6 !important;
        }
        
        .setting-item select, .setting-item input {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
            color: #f3f4f6 !important;
        }
        
        .section-header h3 {
            color: #f3f4f6 !important;
        }
        
        .section-header p {
            color: #9ca3af !important;
        }
        
        select, input, textarea {
            background: #1f2937 !important;
            color: #f3f4f6 !important;
            border-color: #4b5563 !important;
        }
        
        select option {
            background: #374151 !important;
            color: #f3f4f6 !important;
        }
        
        .toast {
            background: #374151 !important;
            color: #f3f4f6 !important;
            border-left-color: #818cf8 !important;
        }
        
        .settings-tab {
            color: #9ca3af !important;
        }
        
        .settings-tab.active {
            color: #818cf8 !important;
            background: #1f2937 !important;
        }
        
        .chart-actions select, .chart-btn {
            background: #1f2937 !important;
            color: #f3f4f6 !important;
            border-color: #4b5563 !important;
        }
        
        .chart-btn:hover {
            background: #4f46e5 !important;
        }
        
        .market-filters input, .market-filters select {
            background: #1f2937 !important;
            color: #f3f4f6 !important;
            border-color: #4b5563 !important;
        }
        
        .quick-analyze-card {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
        }
        
        .ai-analyze-card {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
        }
        
        .analyze-btn, .ai-analyze-btn {
            background: white !important;
            color: #1f2937 !important;
        }
        
        .analyze-btn:hover, .ai-analyze-btn:hover {
            background: #f3f4f6 !important;
        }
        
        .quick-suggestions button, .ai-quick-options button {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .quick-suggestions button:hover, .ai-quick-options button:hover {
            background: white !important;
            color: #1f2937 !important;
        }
        
        .insight-card-large {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #4b5563, #374151) !important;
        }
        
        .recommendations {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
        }
        
        .recommendation-item {
            background: #1f2937 !important;
            border-color: #4b5563 !important;
        }
        
        .recommendation-item:hover {
            border-color: #818cf8 !important;
        }
        
        .search-result-card {
            background: #374151 !important;
            border-color: #4b5563 !important;
        }
        
        .result-stat {
            background: #1f2937 !important;
        }
        
        .market-item {
            border-bottom-color: #4b5563 !important;
        }
        
        .market-item:hover {
            background: #1f2937 !important;
        }
        
        .activity-item, .search-item, .history-item {
            background: #1f2937 !important;
        }
        
        .activity-item:hover, .search-item:hover, .history-item:hover {
            background: #4b5563 !important;
        }
    `;
    
    injectThemeStyles(styles);
}

// Apply Purple Theme
function applyPurpleTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    removeThemeStylesheets();
    
    const styles = `
        :root {
            --primary: #7c3aed;
            --primary-dark: #5b21b6;
            --primary-light: #a78bfa;
            --sidebar: #4c1d95;
        }
        
        body, html {
            background-color: #faf5ff !important;
            color: #1e1b4b !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%) !important;
        }
        
        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
            border-bottom: none !important;
        }
        
        .quick-analyze-card {
            background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
        }
        
        .ai-analyze-card {
            background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%) !important;
        }
        
        .stat-icon {
            background: linear-gradient(135deg, #7c3aed, #a78bfa) !important;
        }
        
        .insight-card-large {
            background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #7c3aed, #a78bfa) !important;
        }
        
        .search-box button, .analyze-btn, .ai-analyze-btn, .apply-filters, .save-settings, .btn-primary {
            background: linear-gradient(135deg, #7c3aed, #a78bfa) !important;
        }
        
        .tag:hover, .quick-suggestions button:hover, .ai-quick-options button:hover {
            background: #7c3aed !important;
            border-color: #7c3aed !important;
        }
    `;
    
    injectThemeStyles(styles);
}

// Apply Ocean Theme
function applyOceanTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    removeThemeStylesheets();
    
    const styles = `
        :root {
            --primary: #0ea5e9;
            --primary-dark: #0369a1;
            --primary-light: #38bdf8;
            --sidebar: #0c4a6e;
        }
        
        body, html {
            background-color: #f0f9ff !important;
            color: #0c4a6e !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
        }
        
        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%) !important;
            border-bottom: none !important;
        }
        
        .quick-analyze-card {
            background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%) !important;
        }
        
        .ai-analyze-card {
            background: linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%) !important;
        }
        
        .stat-icon {
            background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
        }
        
        .insight-card-large {
            background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%) !important;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
        }
        
        .search-box button, .analyze-btn, .ai-analyze-btn, .apply-filters, .save-settings, .btn-primary {
            background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
        }
        
        .tag:hover, .quick-suggestions button:hover, .ai-quick-options button:hover {
            background: #0ea5e9 !important;
            border-color: #0ea5e9 !important;
        }
    `;
    
    injectThemeStyles(styles);
}

// Apply Forest Theme
function applyForestTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    removeThemeStylesheets();
    
    const styles = `
        :root {
            --primary: #10b981;
            --primary-dark: #059669;
            --primary-light: #34d399;
            --sidebar: #064e3b;
        }
        
        body, html {
            background-color: #ecfdf5 !important;
            color: #064e3b !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%) !important;
            border-bottom: none !important;
        }
        
        .quick-analyze-card {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%) !important;
        }
        
        .ai-analyze-card {
            background: linear-gradient(135deg, #34d399 0%, #6ee7b7 100%) !important;
        }
        
        .stat-icon {
            background: linear-gradient(135deg, #10b981, #34d399) !important;
        }
        
        .insight-card-large {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%) !important;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #10b981, #34d399) !important;
        }
        
        .search-box button, .analyze-btn, .ai-analyze-btn, .apply-filters, .save-settings, .btn-primary {
            background: linear-gradient(135deg, #10b981, #34d399) !important;
        }
        
        .tag:hover, .quick-suggestions button:hover, .ai-quick-options button:hover {
            background: #10b981 !important;
            border-color: #10b981 !important;
        }
    `;
    
    injectThemeStyles(styles);
}

// Apply Sunset Theme
function applySunsetTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    removeThemeStylesheets();
    
    const styles = `
        :root {
            --primary: #f97316;
            --primary-dark: #ea580c;
            --primary-light: #fb923c;
            --sidebar: #7c2d12;
        }
        
        body, html {
            background-color: #fffbeb !important;
            color: #7c2d12 !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%) !important;
        }
        
        .header {
            background: linear-gradient(135deg, #f97316 0%, #fb923c 100%) !important;
            border-bottom: none !important;
        }
        
        .quick-analyze-card {
            background: linear-gradient(135deg, #f97316 0%, #fb923c 100%) !important;
        }
        
        .ai-analyze-card {
            background: linear-gradient(135deg, #fb923c 0%, #fdba74 100%) !important;
        }
        
        .stat-icon {
            background: linear-gradient(135deg, #f97316, #fb923c) !important;
        }
        
        .insight-card-large {
            background: linear-gradient(135deg, #f97316 0%, #fb923c 100%) !important;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #f97316, #fb923c) !important;
        }
        
        .search-box button, .analyze-btn, .ai-analyze-btn, .apply-filters, .save-settings, .btn-primary {
            background: linear-gradient(135deg, #f97316, #fb923c) !important;
        }
        
        .tag:hover, .quick-suggestions button:hover, .ai-quick-options button:hover {
            background: #f97316 !important;
            border-color: #f97316 !important;
        }
    `;
    
    injectThemeStyles(styles);
}

// Remove theme stylesheets
function removeThemeStylesheets() {
    const stylesheets = ['theme-mode-styles', 'dark-mode-styles'];
    stylesheets.forEach(id => {
        const styleSheet = document.getElementById(id);
        if (styleSheet) {
            styleSheet.remove();
        }
    });
}

// Inject theme styles
function injectThemeStyles(styles) {
    let styleSheet = document.getElementById('theme-mode-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'theme-mode-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
}

// Setup theme change listener
function setupThemeListener() {
    const themeSelector = document.getElementById('themeSetting');
    if (themeSelector) {
        themeSelector.addEventListener('change', function(e) {
            applyTheme(e.target.value);
            if (window.showToast) {
                window.showToast(`Theme changed to ${e.target.value}`, 'success');
            }
        });
    }
}

// Change theme function (for backward compatibility)
function changeTheme(theme) {
    applyTheme(theme);
}

// Export for use in other scripts
window.applyTheme = applyTheme;
window.changeTheme = changeTheme;
window.initializeTheme = initializeTheme;