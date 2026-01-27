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
    
    // Remove dark mode stylesheet
    const darkStyles = document.getElementById('dark-mode-styles');
    if (darkStyles) {
        darkStyles.remove();
    }
    
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1f2937';
}

// Apply dark theme styles
function applyDarkTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'dark';
    
    document.body.style.backgroundColor = '#1f2937';
    document.body.style.color = '#f3f4f6';
    
    // Dark mode specific adjustments
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
    // Target common elements
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
        
        .date-display {
            background: #374151 !important;
            color: #d1d5db !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container, .welcome-banner {
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
        
        .export-info {
            background: #1f2937 !important;
            border-left-color: #818cf8 !important;
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
    `;
    
    // Inject dark mode styles
    let styleSheet = document.getElementById('dark-mode-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'dark-mode-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
}

// Apply Purple Theme (brand color)
function applyPurpleTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    document.body.style.backgroundColor = '#faf8ff';
    document.body.style.color = '#1f1a3f';
    
    const styles = `
        body, html {
            background-color: #faf8ff !important;
            color: #1f1a3f !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
            color: white !important;
        }
        
        .sidebar .nav-item, .sidebar .nav-item span {
            color: #e9d5ff !important;
        }
        
        .sidebar .nav-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .header {
            background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
            color: white !important;
            border-bottom: none !important;
        }
        
        .header-title h1, .header-title .subtitle, .header-icon-btn {
            color: white !important;
        }
        
        .header-icon-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
        }
        
        .date-display {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container {
            background: white !important;
            border: 1px solid #e9d5ff !important;
            color: #1f1a3f !important;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
            color: white !important;
        }
        
        .tag, .market-tag, .badge {
            background: #ede9fe !important;
            color: #6d28d9 !important;
            border: 1px solid #ddd6fe !important;
        }
        
        .modal-content {
            background: white !important;
            color: #1f1a3f !important;
        }
        
        .modal-header {
            background: #faf8ff !important;
            color: #1f1a3f !important;
            border-color: #e9d5ff !important;
        }
        
        .form-input, textarea, select {
            background: white !important;
            border: 1px solid #ddd6fe !important;
            color: #1f1a3f !important;
        }
        
        .form-input:focus, textarea:focus, select:focus {
            border-color: #7c3aed !important;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
        }
        
        .btn, button {
            color: white !important;
        }
        
        .btn-primary, .btn-primary:hover {
            background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #1f1a3f !important;
        }
    `;
    
    let styleSheet = document.getElementById('theme-mode-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'theme-mode-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
}

// Apply Ocean Theme
function applyOceanTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    document.body.style.backgroundColor = '#f0f9ff';
    document.body.style.color = '#0c2340';
    
    const styles = `
        body, html {
            background-color: #f0f9ff !important;
            color: #0c2340 !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%) !important;
            color: white !important;
        }
        
        .sidebar .nav-item, .sidebar .nav-item span {
            color: #cffafe !important;
        }
        
        .sidebar .nav-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .header {
            background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%) !important;
            color: white !important;
            border-bottom: none !important;
        }
        
        .header-title h1, .header-title .subtitle, .header-icon-btn {
            color: white !important;
        }
        
        .header-icon-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
        }
        
        .date-display {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container {
            background: white !important;
            border: 1px solid #cffafe !important;
            color: #0c2340 !important;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%) !important;
            color: white !important;
        }
        
        .tag, .market-tag, .badge {
            background: #ecf9ff !important;
            color: #0369a1 !important;
            border: 1px solid #cffafe !important;
        }
        
        .modal-content {
            background: white !important;
            color: #0c2340 !important;
        }
        
        .modal-header {
            background: #f0f9ff !important;
            color: #0c2340 !important;
            border-color: #cffafe !important;
        }
        
        .form-input, textarea, select {
            background: white !important;
            border: 1px solid #cffafe !important;
            color: #0c2340 !important;
        }
        
        .form-input:focus, textarea:focus, select:focus {
            border-color: #0891b2 !important;
            box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1) !important;
        }
        
        .btn, button {
            color: white !important;
        }
        
        .btn-primary, .btn-primary:hover {
            background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #0c2340 !important;
        }
    `;
    
    let styleSheet = document.getElementById('theme-mode-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'theme-mode-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
}

// Apply Forest Theme
function applyForestTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    document.body.style.backgroundColor = '#f0fdf4';
    document.body.style.color = '#0f2818';
    
    const styles = `
        body, html {
            background-color: #f0fdf4 !important;
            color: #0f2818 !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
            color: white !important;
        }
        
        .sidebar .nav-item, .sidebar .nav-item span {
            color: #dcfce7 !important;
        }
        
        .sidebar .nav-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
            color: white !important;
            border-bottom: none !important;
        }
        
        .header-title h1, .header-title .subtitle, .header-icon-btn {
            color: white !important;
        }
        
        .header-icon-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
        }
        
        .date-display {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container {
            background: white !important;
            border: 1px solid #dcfce7 !important;
            color: #0f2818 !important;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
            color: white !important;
        }
        
        .tag, .market-tag, .badge {
            background: #ecfdf5 !important;
            color: #059669 !important;
            border: 1px solid #dcfce7 !important;
        }
        
        .modal-content {
            background: white !important;
            color: #0f2818 !important;
        }
        
        .modal-header {
            background: #f0fdf4 !important;
            color: #0f2818 !important;
            border-color: #dcfce7 !important;
        }
        
        .form-input, textarea, select {
            background: white !important;
            border: 1px solid #dcfce7 !important;
            color: #0f2818 !important;
        }
        
        .form-input:focus, textarea:focus, select:focus {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        
        .btn, button {
            color: white !important;
        }
        
        .btn-primary, .btn-primary:hover {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #0f2818 !important;
        }
    `;
    
    let styleSheet = document.getElementById('theme-mode-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'theme-mode-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
}

// Apply Sunset Theme
function applySunsetTheme() {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
    
    document.body.style.backgroundColor = '#fffbeb';
    document.body.style.color = '#44280c';
    
    const styles = `
        body, html {
            background-color: #fffbeb !important;
            color: #44280c !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%) !important;
            color: white !important;
        }
        
        .sidebar .nav-item, .sidebar .nav-item span {
            color: #fef3c7 !important;
        }
        
        .sidebar .nav-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%) !important;
            color: white !important;
            border-bottom: none !important;
        }
        
        .header-title h1, .header-title .subtitle, .header-icon-btn {
            color: white !important;
        }
        
        .header-icon-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
        }
        
        .date-display {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        .stat-card, .chart-container, .markets-container, .insights-container,
        .market-card, .profile-card, .detail-card, .settings-container,
        .search-container {
            background: white !important;
            border: 1px solid #fed7aa !important;
            color: #44280c !important;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%) !important;
            color: white !important;
        }
        
        .tag, .market-tag, .badge {
            background: #fef3c7 !important;
            color: #dc2626 !important;
            border: 1px solid #fed7aa !important;
        }
        
        .modal-content {
            background: white !important;
            color: #44280c !important;
        }
        
        .modal-header {
            background: #fffbeb !important;
            color: #44280c !important;
            border-color: #fed7aa !important;
        }
        
        .form-input, textarea, select {
            background: white !important;
            border: 1px solid #fed7aa !important;
            color: #44280c !important;
        }
        
        .form-input:focus, textarea:focus, select:focus {
            border-color: #f97316 !important;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
        }
        
        .btn, button {
            color: white !important;
        }
        
        .btn-primary, .btn-primary:hover {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #44280c !important;
        }
    `;
    
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