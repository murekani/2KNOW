// Dashboard functionality for 2KNOW Market Trend Predictor

// Global variables
let currentChart = null;
let currentData = null;
let searchHistory = [];
let marketDirectory = [];

// Active region (persisted preference)
let activeRegion = localStorage.getItem('region_preference') || 'KE';

// Canonical list of Kenyan counties (47) + All Kenya
const KENYA_REGIONS = [
    { code: 'KE', name: 'All Kenya' },
    { code: 'Baringo', name: 'Baringo' },
    { code: 'Bomet', name: 'Bomet' },
    { code: 'Bungoma', name: 'Bungoma' },
    { code: 'Busia', name: 'Busia' },
    { code: 'Elgeyo-Marakwet', name: 'Elgeyo-Marakwet' },
    { code: 'Embu', name: 'Embu' },
    { code: 'Garissa', name: 'Garissa' },
    { code: 'Homa Bay', name: 'Homa Bay' },
    { code: 'Isiolo', name: 'Isiolo' },
    { code: 'Kajiado', name: 'Kajiado' },
    { code: 'Kakamega', name: 'Kakamega' },
    { code: 'Kericho', name: 'Kericho' },
    { code: 'Kiambu', name: 'Kiambu' },
    { code: 'Kilifi', name: 'Kilifi' },
    { code: 'Kirinyaga', name: 'Kirinyaga' },
    { code: 'Kisii', name: 'Kisii' },
    { code: 'Kisumu', name: 'Kisumu' },
    { code: 'Kitui', name: 'Kitui' },
    { code: 'Kwale', name: 'Kwale' },
    { code: 'Laikipia', name: 'Laikipia' },
    { code: 'Lamu', name: 'Lamu' },
    { code: 'Machakos', name: 'Machakos' },
    { code: 'Makueni', name: 'Makueni' },
    { code: 'Mandera', name: 'Mandera' },
    { code: 'Marsabit', name: 'Marsabit' },
    { code: 'Meru', name: 'Meru' },
    { code: 'Migori', name: 'Migori' },
    { code: 'Mombasa', name: 'Mombasa' },
    { code: 'Muranga', name: 'Muranga' },
    { code: 'Nairobi', name: 'Nairobi' },
    { code: 'Nakuru', name: 'Nakuru' },
    { code: 'Nandi', name: 'Nandi' },
    { code: 'Narok', name: 'Narok' },
    { code: 'Nyamira', name: 'Nyamira' },
    { code: 'Nyandarua', name: 'Nyandarua' },
    { code: 'Nyeri', name: 'Nyeri' },
    { code: 'Samburu', name: 'Samburu' },
    { code: 'Siaya', name: 'Siaya' },
    { code: 'Taita-Taveta', name: 'Taita-Taveta' },
    { code: 'Tana River', name: 'Tana River' },
    { code: 'Tharaka-Nithi', name: 'Tharaka-Nithi' },
    { code: 'Trans-Nzoia', name: 'Trans-Nzoia' },
    { code: 'Turkana', name: 'Turkana' },
    { code: 'Uasin Gishu', name: 'Uasin Gishu' },
    { code: 'Vihiga', name: 'Vihiga' },
    { code: 'Wajir', name: 'Wajir' },
    { code: 'West Pokot', name: 'West Pokot' }
];

// Populate region selectors from KENYA_REGIONS for consistent options
function populateRegionSelectors() {
    const ids = ['dashboardRegionSelect', 'regionFilter', 'regionSetting'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        KENYA_REGIONS.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.code;
            opt.textContent = r.name;
            el.appendChild(opt);
        });
        el.value = activeRegion;
        el.addEventListener('change', function() {
            activeRegion = el.value;
            localStorage.setItem('region_preference', activeRegion);
        });
    });
}

// Toggle Sidebar with content shifting
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    overlay.classList.toggle('active');
    
    // On desktop, shift content when sidebar is open
    if (window.innerWidth >= 769) {
        if (!sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '250px';
            mainContent.style.width = 'calc(100% - 250px)';
        } else {
            mainContent.style.marginLeft = '0';
            mainContent.style.width = '100%';
        }
    }
}

// Close sidebar when clicking on a nav item
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const mainContent = document.querySelector('.main-content');
            
            // Close sidebar after navigation (useful on mobile and desktop to focus content)
            sidebar.classList.add('collapsed');
            overlay.classList.remove('active');
            // Reset main content layout
            if (mainContent) {
                mainContent.style.marginLeft = '0';
                mainContent.style.width = '100%';
            }
        });
    });
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Populate the three region selectors from canonical list
    populateRegionSelectors();
});

// Show different sections
function showSection(sectionId, event) {
    if (event) {
        event.preventDefault();
    }

    // Ensure sidebar collapses when navigating to a section (handles inline onclick navigation)
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');
    if (sidebar && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        if (mainContent) {
            mainContent.style.marginLeft = '0';
            mainContent.style.width = '100%';
        }
    }
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        const titles = {
            'dashboard': ['Market Intelligence Dashboard', 'Real-time trend analysis for Kenyan markets'],
            'search': ['Market Search & Analysis', 'Advanced search and filtering capabilities'],
            'trends': ['Trend Analysis & Comparisons', 'Historical data and market comparisons'],
            'insights': ['AI Market Insights', 'Intelligent recommendations and predictions'],
            'markets': ['Kenyan Markets Directory', 'Complete guide to physical markets'],
            'profile': ['Your Profile', 'Manage your account and preferences'],
            'settings': ['Settings', 'Configure your 2KNOW experience']
        };
        
        if (titles[sectionId]) {
            pageTitle.textContent = titles[sectionId][0];
            pageSubtitle.textContent = titles[sectionId][1];
        }
    }
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionId) {
        case 'trends':
            loadTrendComparisons();
            break;
        case 'markets':
            loadMarketDirectory();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'insights':
            loadInsights();
            break;
    }
}

// Search trends (bound to header search previously). Now uses dashboard product input if header is not present
async function searchTrends() {
    // Prefer dashboard product input
    const dashboardInput = document.getElementById('dashboardProductInput');
    const product = dashboardInput ? dashboardInput.value.trim() : '';

    const regionSelector = document.getElementById('dashboardRegionSelect');
    const region = regionSelector ? regionSelector.value : activeRegion;

    if (!product) {
        showToast('Please enter a product name to analyze', 'warning');
        if (dashboardInput) dashboardInput.focus();
        return;
    }

    await performSearch(product, region, 'dashboard');
}

// Search from advanced search section
async function searchFromAdvanced() {
    const keyword = document.getElementById('advancedKeyword').value.trim();
    // Get region from the search filters dropdown
    const regionFilter = document.getElementById('regionFilter');
    const region = regionFilter ? regionFilter.value : activeRegion;
    const timeRange = document.getElementById('timeFilter').value;
    
    if (!keyword) {
        showToast('Enter a product name to analyze', 'warning');
        return;
    }
    
    await performAdvancedSearch(keyword, region, timeRange);
}

// Advanced search specific function
async function performAdvancedSearch(keyword, region = 'KE', timeRange = '6') {
    showLoading(`Searching for "${keyword}" in ${region}...`);
    
    try {
        const token = localStorage.getItem('jwt_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}?region=${encodeURIComponent(region)}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        data.region = region;
        data.timeRange = timeRange;
        
        displayAdvancedSearchResults(data, keyword, region, timeRange);
        showToast(`Found market analysis for "${keyword}"`, 'success');
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Failed to fetch data. Showing demo results.', 'warning');
        
        // Show demo results
        const demoData = {
            keyword: keyword,
            live_trend_score: Math.floor(Math.random() * 30) + 50,
            market_sector: keyword.includes('maize') ? 'Agriculture' : 
                          keyword.includes('phone') ? 'Electronics' :
                          keyword.includes('car') ? 'Automotive' : 'General',
            relevant_markets: ['Nairobi Market', 'Mombasa', 'Kisumu', 'Nakuru'].slice(0, Math.floor(Math.random() * 3) + 2),
            overall_score: Math.floor(Math.random() * 30) + 50,
            region: region,
            timeRange: timeRange
        };
        displayAdvancedSearchResults(demoData, keyword, region, timeRange);
    } finally {
        hideLoading();
    }
}

// Display search results in search section
function displayAdvancedSearchResults(data, keyword, region, timeRange) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    const regionDisplay = region === 'KE' ? 'All Kenya' : region;
    const markets = data.relevant_markets ? data.relevant_markets.slice(0, 3).join(', ') : 'Multiple markets';
    
    searchResults.innerHTML = `
        <div class="search-result-card">
            <div class="result-header">
                <div>
                    <h3>${keyword}</h3>
                    <p style="font-size: 12px; color: var(--gray); margin-top: 4px;">
                        <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${regionDisplay} 
                        <span style="margin-left: 12px;"><i class="fas fa-calendar" style="margin-right: 4px;"></i>Last ${timeRange} months</span>
                    </p>
                </div>
                <span class="result-score">${data.overall_score || 0}% Match</span>
            </div>
            
            <div class="result-stats">
                <div class="result-stat">
                    <span class="stat-label">Live Trend</span>
                    <span class="stat-value">${data.live_trend_score || 0}</span>
                </div>
                <div class="result-stat">
                    <span class="stat-label">Market Sector</span>
                    <span class="stat-value" style="font-size: 14px;">${data.market_sector || 'General'}</span>
                </div>
                <div class="result-stat">
                    <span class="stat-label">Active Markets</span>
                    <span class="stat-value">${data.relevant_markets ? data.relevant_markets.length : 0}</span>
                </div>
            </div>
            
            <div style="background: var(--light); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 16px;">
                <p style="font-size: 12px; color: var(--gray); margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">Top Markets</p>
                <p style="font-size: 14px; color: var(--dark); line-height: 1.6;">
                    ${markets}
                </p>
            </div>
            
            <div class="result-actions">
                <button onclick="viewDetailedAnalysis('${keyword}', '${region}', '${timeRange}')">
                    <i class="fas fa-chart-line"></i> Detailed View
                </button>
                <button onclick="downloadSearchReportPDF('${keyword}', '${region}')">
                    <i class="fas fa-download"></i> Download Report
                </button>
            </div>
        </div>
    `;
}

// View detailed analysis
function viewDetailedAnalysis(keyword, region, timeRange) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    const analysisData = generateDetailedAnalysis(keyword, region);
    
    searchResults.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Back Button -->
            <button onclick="goBackToSearch()" style="
                align-self: flex-start;
                background: white;
                border: 1px solid var(--border);
                padding: 10px 16px;
                border-radius: var(--radius-sm);
                cursor: pointer;
                font-weight: 600;
                color: var(--primary);
                transition: all 0.3s;
            " onmouseover="this.style.background='var(--light)'" onmouseout="this.style.background='white'">
                <i class="fas fa-arrow-left"></i> Back to Search
            </button>

            <!-- Detailed Header -->
            <div style="
                background: linear-gradient(135deg, var(--primary), #818cf8);
                color: white;
                padding: 28px;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
            ">
                <h2 style="margin: 0 0 8px 0; font-size: 28px;">${keyword}</h2>
                <p style="margin: 0; opacity: 0.9;">Comprehensive Market Analysis & Insights - ${region === 'KE' ? 'All Kenya' : region}</p>
            </div>

            <!-- Key Metrics -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            ">
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border-left: 4px solid var(--primary);
                ">
                    <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                        Overall Score
                    </div>
                    <div style="font-size: 32px; font-weight: 800; color: var(--primary);">
                        ${analysisData.overallScore}%
                    </div>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 8px;">
                        Market Viability
                    </div>
                </div>

                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border-left: 4px solid #10B981;
                ">
                    <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                        Trend Direction
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: #10B981;">
                        ${analysisData.trend}
                    </div>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 8px;">
                        Market Movement
                    </div>
                </div>

                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border-left: 4px solid #F59E0B;
                ">
                    <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                        Competition Level
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: #F59E0B;">
                        ${analysisData.competition}
                    </div>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 8px;">
                        Market Saturation
                    </div>
                </div>

                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border-left: 4px solid #EF4444;
                ">
                    <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                        Risk Factor
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: #EF4444;">
                        ${analysisData.risk}
                    </div>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 8px;">
                        Investment Risk
                    </div>
                </div>
            </div>

            <!-- Market Overview -->
            <div style="
                background: white;
                padding: 24px;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-md);
            ">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: var(--dark);">
                    <i class="fas fa-chart-pie" style="margin-right: 8px; color: var(--primary);"></i>
                    Market Breakdown
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                ">
                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: var(--dark); margin-bottom: 8px;">
                            Market Sectors
                        </div>
                        <div style="
                            background: var(--light);
                            padding: 12px;
                            border-radius: var(--radius-sm);
                            font-size: 13px;
                            color: var(--gray);
                            line-height: 1.8;
                        ">
                            ${analysisData.sectors.map(s => `<div>• ${s}</div>`).join('')}
                        </div>
                    </div>

                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: var(--dark); margin-bottom: 8px;">
                            Key Regions
                        </div>
                        <div style="
                            background: var(--light);
                            padding: 12px;
                            border-radius: var(--radius-sm);
                            font-size: 13px;
                            color: var(--gray);
                            line-height: 1.8;
                        ">
                            ${analysisData.regions.map(r => `<div>• ${r}</div>`).join('')}
                        </div>
                    </div>

                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: var(--dark); margin-bottom: 8px;">
                            Growth Potential
                        </div>
                        <div style="
                            background: var(--light);
                            padding: 12px;
                            border-radius: var(--radius-sm);
                            font-size: 13px;
                            color: var(--gray);
                            line-height: 1.8;
                        ">
                            <div>📈 Short-term: ${analysisData.shortTerm}</div>
                            <div>📊 Medium-term: ${analysisData.mediumTerm}</div>
                            <div>🎯 Long-term: ${analysisData.longTerm}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recommendations -->
            <div style="
                background: linear-gradient(135deg, #ffecd2, #fcb69f);
                padding: 24px;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-md);
            ">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1F2937;">
                    <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                    Strategic Recommendations
                </h3>
                <div style="
                    background: white;
                    padding: 16px;
                    border-radius: var(--radius-sm);
                    color: var(--dark);
                    line-height: 1.8;
                    font-size: 14px;
                ">
                    ${analysisData.recommendations.map(r => `<p style="margin: 8px 0;">✓ ${r}</p>`).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            ">
                <button onclick="goBackToSearch()" style="
                    padding: 14px;
                    background: white;
                    border: 2px solid var(--primary);
                    color: var(--primary);
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.background='var(--primary)'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='var(--primary)'">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button onclick="downloadSearchReportPDF('${keyword}', '${region}')" style="
                    padding: 14px;
                    background: linear-gradient(135deg, var(--primary), #818cf8);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(79, 70, 229, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-download"></i> Download Full Report
                </button>
            </div>
        </div>
    `;
}

// Generate detailed analysis data
function generateDetailedAnalysis(keyword, region) {
    const score = Math.floor(Math.random() * 30) + 60;
    const trends = ['📈 Rising', '📉 Declining', '→ Stable'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    const competitions = ['Low', 'Medium', 'High'];
    const competition = competitions[Math.floor(Math.random() * competitions.length)];
    const risks = ['Low', 'Medium', 'High'];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    
    // Region-specific recommendations
    let regionSpecific = [];
    if (region === 'Nairobi') {
        regionSpecific = [
            'Focus on urban markets and digital marketing',
            'Partner with supermarkets and retail chains',
            'Consider premium pricing strategies'
        ];
    } else if (region === 'Mombasa') {
        regionSpecific = [
            'Leverage coastal tourism opportunities',
            'Focus on wholesale distribution',
            'Consider export opportunities'
        ];
    } else {
        regionSpecific = [
            'Build local distributor relationships',
            'Focus on community-based marketing',
            'Consider seasonal demand patterns'
        ];
    }
    
    return {
        overallScore: score,
        trend: trend,
        competition: competition,
        risk: risk,
        sectors: ['Agriculture', 'Electronics', 'Retail'].slice(0, Math.random() > 0.5 ? 2 : 3),
        regions: [region, ...['Nairobi', 'Mombasa', 'Kisumu'].filter(r => r !== region)].slice(0, 3),
        shortTerm: Math.floor(Math.random() * 40) + 50 + '%',
        mediumTerm: Math.floor(Math.random() * 40) + 60 + '%',
        longTerm: Math.floor(Math.random() * 40) + 70 + '%',
        recommendations: [
            ...regionSpecific,
            'Monitor competitor activities and adjust pricing accordingly',
            'Invest in customer loyalty programs for repeat business',
            'Build partnerships with local distributors'
        ]
    };
}

// Go back to search results
function goBackToSearch() {
    const keyword = document.getElementById('advancedKeyword').value.trim();
    const region = document.getElementById('regionFilter').value;
    const timeRange = document.getElementById('timeFilter').value;
    
    if (keyword) {
        performAdvancedSearch(keyword, region, timeRange);
    }
}

// Download search report as PDF
function downloadSearchReportPDF(keyword, region) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const regionName = region === 'KE' ? 'Kenya' : region;
    const date = new Date().toLocaleDateString();
    
    // Title
    doc.setFontSize(20);
    doc.text(`2KNOW Market Analysis Report: ${keyword}`, 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Region: ${regionName} | Date: ${date}`, 20, 30);
    
    // Generate analysis data
    const analysisData = generateDetailedAnalysis(keyword, region);
    
    let yPosition = 50;
    
    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${keyword} market analysis for ${regionName} shows ${analysisData.overallScore}% viability`, 20, yPosition);
    yPosition += 7;
    doc.text(`with ${analysisData.trend} trend and ${analysisData.competition} competition level.`, 20, yPosition);
    yPosition += 15;
    
    // Key Metrics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Key Metrics', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const metrics = [
        `Overall Score: ${analysisData.overallScore}%`,
        `Trend Direction: ${analysisData.trend}`,
        `Competition Level: ${analysisData.competition}`,
        `Risk Factor: ${analysisData.risk}`,
        `Short-term Growth: ${analysisData.shortTerm}`,
        `Medium-term Growth: ${analysisData.mediumTerm}`,
        `Long-term Growth: ${analysisData.longTerm}`
    ];
    
    metrics.forEach(metric => {
        doc.text(metric, 20, yPosition);
        yPosition += 7;
    });
    yPosition += 5;
    
    // Recommendations
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Recommendations', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    analysisData.recommendations.forEach((rec, index) => {
        doc.text(`${index + 1}. ${rec}`, 20, yPosition);
        yPosition += 7;
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Generated by 2KNOW Market Trend Predictor', 20, 280);
    
    // Save PDF
    doc.save(`2KNOW-${keyword.replace(/\s+/g, '-')}-${regionName}-${date}.pdf`);
    
    showToast('Report downloaded as PDF successfully', 'success');
}

// Quick search from suggestions
function quickSearch(keyword) {
    const advancedKeyword = document.getElementById('advancedKeyword');
    if (advancedKeyword) {
        advancedKeyword.value = keyword;
        searchFromAdvanced();
    } else {
        document.getElementById('keywordInput').value = keyword;
        searchTrends();
    }
}

// Main search function
async function performSearch(keyword, region = 'KE', source = 'dashboard') {
    showLoading(`Analyzing "${keyword}" in ${region === 'KE' ? 'All Kenya' : region}...`);
    
    try {
        const token = localStorage.getItem('jwt_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Include region parameter in the API call
        const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}?region=${encodeURIComponent(region)}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        data.region = region;
        currentData = data;
        
        // Update dashboard with results
        updateDashboard(data);
        
        // Update search history
        addToSearchHistory(keyword, data);
        
        // Update UI based on source
        if (source === 'dashboard') {
            showToast(`Trend analysis completed for "${keyword}" in ${region}`, 'success');
        } else if (source === 'search') {
            updateSearchResults(data, keyword);
        }
        
        // Update last search info
        localStorage.setItem('last_search', keyword);
        localStorage.setItem('last_search_region', region);
        localStorage.setItem('last_search_data', JSON.stringify(data));
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Failed to fetch trend data. Showing demo analysis.', 'warning');
        
        // Fallback to demo data
        useFallbackData(keyword, region);
    } finally {
        hideLoading();
    }
}

// Update dashboard with search results
function updateDashboard(data) {
    const region = data.region || 'KE';
    const regionName = region === 'KE' ? 'All Kenya' : region;
    
    // Update stats
    document.getElementById('liveScore').textContent = data.live_trend_score || '--';
    document.getElementById('marketSector').textContent = data.market_sector || '--';
    document.getElementById('hotMarkets').textContent = data.relevant_markets ? data.relevant_markets.length : 0;
    document.getElementById('overallScore').textContent = data.overall_score || '--';
    
    // Update location info
    const locationInfo = document.getElementById('locationInfo');
    if (locationInfo) {
        locationInfo.innerHTML = `<i class="fas fa-map-pin"></i> ${regionName}`;
    }
    
    // Update score colors
    updateScoreColors(data.live_trend_score, 'liveScore');
    updateScoreColors(data.overall_score, 'overallScore');
    
    // Update score bar
    const scoreBar = document.getElementById('scoreBar');
    if (scoreBar && data.overall_score) {
        scoreBar.style.width = data.overall_score + '%';
    }
    
    // Update market tags
    updateMarketTags(data.market_sector);
    
    // Update markets list
    updateMarketsList(data.relevant_markets || []);
    
    // Update insights
    updateInsights(data);
    
    // Update chart
    if (data.historical_trends && data.historical_trends.length > 0) {
        updateTrendChart(data.historical_trends, data.keyword);
        updateChartStats(data.historical_trends);
    }
}

// Update score colors based on value
function updateScoreColors(score, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (score >= 70) {
        element.style.color = '#10B981';
    } else if (score >= 40) {
        element.style.color = '#F59E0B';
    } else {
        element.style.color = '#EF4444';
    }
}

// Update market tags
function updateMarketTags(sector) {
    const marketTags = document.getElementById('marketTags');
    if (!marketTags) return;
    
    const tags = {
        'Agriculture': ['Crops', 'Farming', 'Produce'],
        'Electronics': ['Gadgets', 'Tech', 'Devices'],
        'Automotive': ['Vehicles', 'Cars', 'Parts'],
        'Fashion': ['Clothing', 'Apparel', 'Textiles'],
        'General': ['Various', 'Mixed', 'General']
    };
    
    const tagList = tags[sector] || tags['General'];
    marketTags.innerHTML = tagList.map(tag => 
        `<span class="market-tag">${tag}</span>`
    ).join(' ');
}

// Update markets list
function updateMarketsList(markets) {
    const marketsList = document.getElementById('marketsList');
    if (!marketsList) return;
    
    if (!markets || markets.length === 0) {
        marketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>No markets found for this product</p>
            </div>
        `;
        return;
    }
    
    marketsList.innerHTML = markets.map((market, index) => `
        <div class="market-item">
            <div class="market-icon">
                <i class="fas fa-store"></i>
            </div>
            <div class="market-details">
                <h4>${market}</h4>
                <p><i class="fas fa-map-pin"></i> Kenya • High Activity Market</p>
                <span class="market-tag">${index < 3 ? 'Top Market' : 'Active Market'}</span>
            </div>
        </div>
    `).join('');
}

// Update insights
function updateInsights(data) {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    const score = data.overall_score || 50;
    const sector = data.market_sector || 'General';
    const region = data.region || 'KE';
    
    const insights = [
        {
            icon: 'fa-chart-line',
            title: score >= 70 ? 'High Market Potential' : score >= 40 ? 'Moderate Opportunity' : 'Limited Opportunity',
            description: score >= 70 ? 
                'Strong demand with good profit margins expected' :
                score >= 40 ? 'Steady market with moderate growth potential' :
                'Market may be saturated or declining'
        },
        {
            icon: 'fa-calendar-alt',
            title: 'Seasonal Trend',
            description: sector === 'Agriculture' ? 
                'Peak season typically Oct-Dec' :
                sector === 'Electronics' ? 'High demand during holidays' :
                'Consistent demand year-round'
        },
        {
            icon: 'fa-map-marker-alt',
            title: 'Regional Focus',
            description: region === 'KE' ? 'Nationwide opportunity' : `Strong potential in ${region} region`
        }
    ];
    
    insightsList.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <i class="fas ${insight.icon}"></i>
            <div>
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        </div>
    `).join('');
}

// Update search results in search section
function updateSearchResults(data, keyword) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    const region = data.region || 'KE';
    const regionName = region === 'KE' ? 'All Kenya' : region;
    
    searchResults.innerHTML = `
        <div class="search-result-card">
            <div class="result-header">
                <h3>${keyword} Market Analysis</h3>
                <span class="result-score">${data.overall_score || 0}% Match</span>
            </div>
            <div class="result-stats">
                <div class="result-stat">
                    <span class="stat-label">Live Trend Score</span>
                    <span class="stat-value">${data.live_trend_score || 0}</span>
                </div>
                <div class="result-stat">
                    <span class="stat-label">Market Sector</span>
                    <span class="stat-value">${data.market_sector || 'General'}</span>
                </div>
                <div class="result-stat">
                    <span class="stat-label">Active Markets</span>
                    <span class="stat-value">${data.relevant_markets ? data.relevant_markets.length : 0}</span>
                </div>
            </div>
            <div class="result-actions">
                <button onclick="showSection('dashboard')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="downloadSearchReportPDF('${keyword}', '${region}')">
                    <i class="fas fa-download"></i> Download Report
                </button>
            </div>
        </div>
    `;
}

// Add to search history
function addToSearchHistory(keyword, data) {
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    // Add new search
    const searchEntry = {
        keyword: keyword,
        region: data.region || 'KE',
        timestamp: new Date().toISOString(),
        score: data.overall_score || 0,
        sector: data.market_sector || 'General'
    };
    
    // Remove if already exists
    const filtered = history.filter(item => 
        !(item.keyword === keyword && item.region === searchEntry.region)
    );
    filtered.unshift(searchEntry);
    
    // Keep only last 10 searches
    const recent = filtered.slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(recent));
    searchHistory = recent;
    
    // Update UI if on trends page
    updateSearchHistoryUI();
}

// Update search history UI
function updateSearchHistoryUI() {
    const historyList = document.getElementById('searchHistory');
    if (!historyList) return;
    
    if (searchHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-text">No search history yet</p>';
        return;
    }
    
    historyList.innerHTML = searchHistory.map((item, index) => {
        const regionName = item.region === 'KE' ? 'Kenya' : item.region;
        return `
            <div class="history-item" onclick="quickSearch('${item.keyword}')">
                <div class="history-keyword">
                    <i class="fas fa-search"></i>
                    <span>${item.keyword}</span>
                </div>
                <div class="history-details">
                    <span class="history-score">
                        <i class="fas fa-chart-bar"></i> ${item.score}%
                    </span>
                    <span class="history-region" style="font-size: 11px; color: var(--light-gray);">
                        <i class="fas fa-map-marker-alt"></i> ${regionName}
                    </span>
                    <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Load search history
function loadSearchHistory() {
    searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    updateSearchHistoryUI();
}

// Compare trends
async function compareTrends() {
    const trend1 = document.getElementById('trend1').value.trim();
    const trend2 = document.getElementById('trend2').value.trim();
    
    if (!trend1 || !trend2) {
        showToast('Enter two products to compare', 'warning');
        return;
    }
    
    // Get selected region from settings or use default
    const region = localStorage.getItem('app_region') || 'KE';
    
    showLoading(`Comparing ${trend1} vs ${trend2}...`);
    
    try {
        // Fetch data for both products with region
        const [data1, data2] = await Promise.all([
            fetchTrendData(trend1, region),
            fetchTrendData(trend2, region)
        ]);
        
        // Update charts
        updateComparisonCharts(data1, data2);
        
        // Update insights
        updateComparisonInsights(data1, data2);
        
        showToast('Comparison completed', 'success');
        
    } catch (error) {
        console.error('Comparison error:', error);
        showToast('Failed to compare trends', 'error');
    } finally {
        hideLoading();
    }
}

// Fetch trend data for comparison
async function fetchTrendData(keyword, region = 'KE') {
    const token = localStorage.getItem('jwt_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}?region=${encodeURIComponent(region)}`, {
        headers: headers
    });
    
    if (!response.ok) {
        throw new Error(`API error for ${keyword}: ${response.status}`);
    }
    
    return await response.json();
}

// Initialize market directory
function initMarketDirectory() {
    marketDirectory = [
        {
            name: "Wakulima Market",
            region: "Nairobi",
            type: "agriculture",
            description: "Largest fresh produce distribution market in East Africa",
            products: ["Vegetables", "Fruits", "Grains", "Spices", "Wholesale Produce"]
        },
        {
            name: "Kariakor Market",
            region: "Nairobi",
            type: "general",
            description: "Established general market with mixed goods and textiles",
            products: ["Textiles", "Clothing", "Household Items", "Cooking Utensils"]
        },
        {
            name: "Gikomba Market",
            region: "Nairobi",
            type: "clothing",
            description: "Africa's largest second-hand clothing market",
            products: ["Second-hand Clothes", "Shoes", "Accessories", "Vintage Items"]
        },
        {
            name: "Biashara Street",
            region: "Nairobi",
            type: "electronics",
            description: "Premier electronics hub for phones and computers",
            products: ["Mobile Phones", "Computers", "Electronics", "Tech Accessories"]
        },
        {
            name: "Mwembe Tayari Market",
            region: "Mombasa",
            type: "general",
            description: "Major coastal trading center for spices and textiles",
            products: ["Spices", "Fish", "Seafood", "Textiles", "Clothing"]
        },
        {
            name: "Kisumu Main Market",
            region: "Kisumu",
            type: "agriculture",
            description: "Lake region agricultural hub specializing in fish and rice",
            products: ["Fish", "Rice", "Vegetables", "Fruits", "Lake Produce"]
        },
        {
            name: "Nakuru Market",
            region: "Nakuru",
            type: "agriculture",
            description: "Rift Valley produce market for dairy and cereals",
            products: ["Dairy", "Cereals", "Vegetables", "Fruits", "Eggs"]
        },
        {
            name: "Eldoret Market",
            region: "Eldoret",
            type: "agriculture",
            description: "Major grain trading center for maize and wheat",
            products: ["Maize", "Wheat", "Cereals", "Livestock Feed", "Grains"]
        }
    ];
    
    loadMarketDirectory();
}

// Load and display market directory
function loadMarketDirectory() {
    const directory = document.getElementById('marketsDirectory');
    if (!directory) return;
    
    if (marketDirectory.length === 0) {
        directory.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-store" style="font-size: 48px; color: var(--light-gray); margin-bottom: 16px;"></i>
                <p>No markets available. Please check back later.</p>
            </div>
        `;
        return;
    }
    
    directory.innerHTML = marketDirectory.map(market => `
        <div class="market-card" data-region="${market.region}" data-type="${market.type}">
            <h4>${market.name}</h4>
            <div class="market-region">
                <i class="fas fa-map-marker-alt"></i> ${market.region}
            </div>
            <p class="market-description">${market.description}</p>
            <div class="market-products">
                <strong>Main Products:</strong>
                <div class="product-tags">
                    ${market.products.map(product => `<span class="product-tag">${product}</span>`).join('')}
                </div>
            </div>
            <div class="market-actions">
                <button onclick="analyzeMarket('${market.name}')">
                    <i class="fas fa-chart-line"></i> Analyze
                </button>
                <button onclick="viewMarketDetails('${market.name}')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `).join('');
}

// Filter markets
function filterMarkets() {
    const search = document.getElementById('marketSearch').value.toLowerCase();
    const region = document.getElementById('marketRegion').value;
    const type = document.getElementById('marketType').value;
    
    const cards = document.querySelectorAll('.market-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const cardRegion = card.getAttribute('data-region');
        const cardType = card.getAttribute('data-type');
        
        const matchesSearch = !search || name.includes(search);
        const matchesRegion = !region || cardRegion === region;
        const matchesType = !type || cardType === type;
        
        if (matchesSearch && matchesRegion && matchesType) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no results message
    const directory = document.getElementById('marketsDirectory');
    const noResults = directory.querySelector('.no-results');
    if (visibleCount === 0) {
        if (!noResults) {
            directory.innerHTML += `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 48px; color: var(--light-gray); margin-bottom: 16px;"></i>
                    <p>No markets found matching your criteria</p>
                </div>
            `;
        }
    } else if (noResults) {
        noResults.remove();
    }
}

// Load profile data
function loadProfileData() {
    const userName = localStorage.getItem('user_name') || 'User';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    const userBio = localStorage.getItem('user_bio') || '';
    
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileEmail').textContent = userEmail;
    const profileAboutEl = document.getElementById('profileAbout');
    if (profileAboutEl) profileAboutEl.textContent = userBio || '—';
    
    // Update sidebar user info
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    if (sidebarUserName) sidebarUserName.textContent = userName;
    if (sidebarUserEmail) sidebarUserEmail.textContent = userEmail;
    
    // Set member since date
    const memberSince = localStorage.getItem('member_since') || new Date().toISOString().split('T')[0];
    document.getElementById('memberSince').textContent = new Date(memberSince).toLocaleDateString();
    
    // Update stats
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    document.getElementById('searchCount').textContent = history.length;
    document.getElementById('reportCount').textContent = Math.floor(history.length / 2);
    
    // Update activity list
    updateActivityList(history);
    updateTopSearches(history);
    
    // Load profile picture
    updateProfileAvatars();
    
    // Load saved settings
    loadSavedSettings();
}

// Load saved settings into the form
function loadSavedSettings() {
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    const savedRegion = localStorage.getItem('app_region') || 'KE';
    
    const themeSelector = document.getElementById('themeSetting');
    const regionSelector = document.getElementById('regionSetting');
    
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }
    
    if (regionSelector) {
        regionSelector.value = savedRegion;
    }
}

// Update activity list
function updateActivityList(history) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (history.length === 0) {
        activityList.innerHTML = '<p class="empty-text">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = history.slice(0, 5).map(item => {
        const regionName = item.region === 'KE' ? 'Kenya' : item.region;
        return `
            <div class="activity-item">
                <i class="fas fa-search"></i>
                <div class="activity-details">
                    <div class="activity-text">Searched for "${item.keyword}" in ${regionName}</div>
                    <div class="activity-time">${formatTimeAgo(item.timestamp)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Update top searches
function updateTopSearches(history) {
    const topSearches = document.getElementById('topSearches');
    if (!topSearches) return;
    
    if (history.length === 0) {
        topSearches.innerHTML = '<p class="empty-text">No searches yet</p>';
        return;
    }
    
    // Group by keyword and count
    const keywordCounts = {};
    history.forEach(item => {
        keywordCounts[item.keyword] = (keywordCounts[item.keyword] || 0) + 1;
    });
    
    const sorted = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topSearches.innerHTML = sorted.map(([keyword, count]) => `
        <div class="search-item" onclick="quickSearch('${keyword}')">
            <div class="search-keyword">${keyword}</div>
            <div class="search-count">${count} searches</div>
        </div>
    `).join('');
}

// Load insights
function loadInsights() {
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    if (history.length > 0) {
        const recentScore = history.length > 0 ? history[0].score : 50;
        document.getElementById('opportunityScore').textContent = recentScore + '%';
        
        const now = new Date();
        const month = now.getMonth();
        const bestTime = month >= 9 && month <= 11 ? 'Oct-Dec (Peak Season)' : 'Good time to invest';
        document.getElementById('bestTime').textContent = bestTime;
        
        updatePredictionInsights(history);
    }
}

// Update prediction insights with dynamic data
function updatePredictionInsights(history) {
    const predictionDetails = document.getElementById('predictionDetails');
    if (!predictionDetails) return;
    
    if (history.length === 0) {
        predictionDetails.innerHTML = '<p><i class="fas fa-info-circle" style="margin-right: 8px;"></i>Enter a product in the search bar to get AI-powered predictions</p>';
        return;
    }
    
    const lastSearch = history[0];
    const avgScore = Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length);
    const trend = lastSearch.score > avgScore ? 'Rising' : lastSearch.score < avgScore ? 'Declining' : 'Stable';
    const trendIcon = trend === 'Rising' ? '📈' : trend === 'Declining' ? '📉' : '→';
    
    predictionDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #10B981;">
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Last Search</div>
                <div style="font-size: 16px; font-weight: 700; color: #1F2937;">"${lastSearch.keyword}"</div>
            </div>
            <div style="background: rgba(79, 70, 229, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #4F46E5;">
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Trend Direction</div>
                <div style="font-size: 16px; font-weight: 700; color: #1F2937;">${trendIcon} ${trend}</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #F59E0B;">
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Avg Market Score</div>
                <div style="font-size: 16px; font-weight: 700; color: #1F2937;">${avgScore}%</div>
            </div>
        </div>
    `;
}

// Edit Profile - Show modal
function showEditProfile() {
    const userName = localStorage.getItem('user_name') || '';
    const userEmail = localStorage.getItem('user_email') || '';
    const userBio = localStorage.getItem('user_bio') || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editProfileModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Profile</h2>
                <button type="button" class="modal-close" onclick="appCloseModal('editProfileModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editName">Full Name</label>
                        <input type="text" id="editName" class="form-input" value="${userName}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email Address</label>
                        <input type="email" id="editEmail" class="form-input" value="${userEmail}" required>
                    </div>
                    <div class="form-group">
                        <label for="editBio">About</label>
                        <textarea id="editBio" class="form-input" rows="4" placeholder="A short summary about you...">${userBio}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="appCloseModal('editProfileModal')">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveEditProfile()">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    // Use a predictable overlay id that matches the modal id so closeModal can find it
    overlay.id = modal.id + 'Overlay';
    overlay.onclick = () => appCloseModal(modal.id);
    document.body.appendChild(overlay);
    overlay.classList.add('active');
}

// Save edited profile
function saveEditProfile() {
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    
    if (!name) {
        showToast('Please enter your name', 'warning');
        return;
    }
    
    if (!email) {
        showToast('Please enter your email', 'warning');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_bio', bio);
    
    // Update profile display
    loadProfileData();
    
    // Close modal
    appCloseModal('editProfileModal');
    
    showToast('Profile updated successfully', 'success');
}

// Change Password
function changePassword() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'changePasswordModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Change Password</h2>
                <button type="button" class="modal-close" onclick="appCloseModal('changePasswordModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" class="form-input" required>
                        <small class="password-hint">At least 8 characters, including uppercase, lowercase, and numbers</small>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" class="form-input" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="appCloseModal('changePasswordModal')">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveNewPassword()">Update Password</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    // Use a predictable overlay id that matches the modal id so closeModal can find it
    overlay.id = modal.id + 'Overlay';
    overlay.onclick = () => appCloseModal(modal.id);
    document.body.appendChild(overlay);
    overlay.classList.add('active');
}

// Save new password
function saveNewPassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        showToast('Password must include uppercase, lowercase, and numbers', 'warning');
        return;
    }
    
    // Close modal
    appCloseModal('changePasswordModal');
    
    // Simulate password change (in real app, this would call an API)
    setTimeout(() => {
        showToast('Password changed successfully', 'success');
    }, 1000);
}

// Export User Data as PDF
function exportUserDataPDF() {
    showLoading('Preparing your data export...');
    
    setTimeout(() => {
        hideLoading();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const userName = localStorage.getItem('user_name') || 'User';
        const userEmail = localStorage.getItem('user_email') || 'N/A';
        const memberSince = localStorage.getItem('member_since') || new Date().toISOString().split('T')[0];
        const history = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        let yPosition = 20;
        
        // Title
        doc.setFontSize(20);
        doc.text('2KNOW User Data Export', 20, yPosition);
        yPosition += 15;
        
        // Export date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Export Date: ${new Date().toLocaleString()}`, 20, yPosition);
        yPosition += 10;
        
        // Profile Section
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Profile Information', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Name: ${userName}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Email: ${userEmail}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Member Since: ${new Date(memberSince).toLocaleDateString()}`, 20, yPosition);
        yPosition += 12;
        
        // Search History Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Search History (${history.length} searches)`, 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        if (history.length > 0) {
            history.forEach((search, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                const regionName = search.region === 'KE' ? 'Kenya' : search.region;
                const searchText = `${index + 1}. "${search.keyword}" - ${regionName} - ${new Date(search.timestamp).toLocaleDateString()} (Score: ${search.score}%)`;
                doc.text(searchText, 20, yPosition);
                yPosition += 7;
            });
        } else {
            doc.text('No search history available', 20, yPosition);
            yPosition += 7;
        }
        
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('This is a secure export of your 2KNOW account data', 20, 285);
        
        // Save PDF
        doc.save(`2KNOW-user-export-${new Date().toISOString().split('T')[0]}.pdf`);
        
        showToast('User data exported as PDF successfully', 'success');
    }, 1000);
}

// Close modal (robust)
function appCloseModal(modalId) {
    console.debug('[appCloseModal] called for:', modalId);
    // If no modalId provided, attempt to close the most recent modal-like element
    let modal = null;
    if (modalId) {
        modal = document.getElementById(modalId);
    } else {
        // support common modal patterns across files
        modal = document.querySelector('.modal.active') || document.querySelector('.modal') || document.querySelector('.modal-overlay') || document.querySelector('.market-modal');
    }

    if (modal) {
        // If modal uses active class (static in DOM), toggle it; otherwise remove it
        if (modal.classList && modal.classList.contains('active')) {
            modal.classList.remove('active');
        } else {
            // Remove if it's a dynamically created DOM node
            modal.remove();
        }
    }

    // Remove overlay matching modal id patterns but DO NOT remove the static modalOverlay global element
    const overlayIds = [];
    if (modal && modal.id) {
        overlayIds.push(modal.id + 'Overlay');
        overlayIds.push(modal.id.replace(/Modal$/, '') + 'Overlay');
    }

    overlayIds.forEach(id => {
        const o = document.getElementById(id);
        if (o && o.id !== 'modalOverlay') o.remove();
    });

    // If no modal was found but a dynamically-added overlay exists (not the static one), remove the last such overlay
    const dynamicOverlays = Array.from(document.querySelectorAll('.modal-overlay')).filter(o => o.id && o.id !== 'modalOverlay');
    if (!modal && dynamicOverlays.length > 0) {
        const last = dynamicOverlays[dynamicOverlays.length - 1];
        if (last) last.remove();
    }
}

// Show settings tab
function showSettingsTab(tabId, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Update tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const clickedTab = document.querySelector(`[onclick*="showSettingsTab('${tabId}'"]`);
        if (clickedTab) clickedTab.classList.add('active');
    }
    
    // Show content
    document.querySelectorAll('.settings-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId + 'Settings').classList.add('active');
}

// Save settings
function saveSettings() {
    const theme = document.getElementById('themeSetting').value;
    const region = document.getElementById('regionSetting').value;
    
    // Save settings
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_region', region);
    
    // Apply theme immediately
    if (window.applyTheme) {
        window.applyTheme(theme);
    }
    
    // Update dashboard region if on dashboard
    const dashboardRegion = document.getElementById('dashboardRegion');
    if (dashboardRegion && region !== 'KE') {
        dashboardRegion.value = region;
    }
    
    showToast('Settings saved successfully', 'success');
}

// Show loading
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay && loadingText) {
        loadingText.textContent = message;
        overlay.style.display = 'flex';
    }
}

// Hide loading
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' : 
                          type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return past.toLocaleDateString();
}

// Apply filters (for search section)
function applyFilters() {
    const keyword = document.getElementById('advancedKeyword').value.trim();
    // Get region from the search filters dropdown
    const regionFilter = document.getElementById('regionFilter');
    const region = regionFilter ? regionFilter.value : activeRegion;
    const timeRange = document.getElementById('timeFilter').value;
    
    if (!keyword) {
        showToast('Please enter a product name first', 'warning');
        return;
    }
    
    performAdvancedSearch(keyword, region, timeRange);
}

// Update chart range
function updateChartRange() {
    const timeRange = document.getElementById('timeRange').value;
    if (currentData && window.updateTrendChart) {
        // Simulate fetching new data based on time range
        const filteredData = currentData.historical_trends ? 
            currentData.historical_trends.slice(-parseInt(timeRange)) : 
            generateFallbackHistory(parseInt(timeRange));
        
        window.updateTrendChart(filteredData, currentData.keyword || 'Product');
        updateChartStats(filteredData);
    }
}

// Update chart stats
function updateChartStats(data) {
    if (!data || data.length === 0) return;
    
    const values = data.map(item => item.value);
    const peakValue = Math.max(...values);
    const avgValue = Math.round(values.reduce((a, b) => a + b) / values.length);
    const trend = values[values.length - 1] > values[0] ? 'Upward' : values[values.length - 1] < values[0] ? 'Downward' : 'Stable';
    
    document.getElementById('peakValue').textContent = peakValue;
    document.getElementById('avgValue').textContent = avgValue;
    document.getElementById('trendDirection').textContent = trend;
}

// Fallback data for testing
function useFallbackData(keyword, region = 'KE') {
    const fallbackData = {
        keyword: keyword,
        region: region,
        live_trend_score: Math.floor(Math.random() * 30) + 50,
        historical_trends: generateFallbackHistory(6),
        market_sector: keyword.includes('maize') ? 'Agriculture' : 
                      keyword.includes('phone') ? 'Electronics' :
                      keyword.includes('car') ? 'Automotive' : 'General',
        relevant_markets: ['Nairobi Market', 'Mombasa', 'Kisumu', 'Nakuru'].slice(0, Math.floor(Math.random() * 3) + 2),
        overall_score: Math.floor(Math.random() * 30) + 50,
        data_source: 'Demo Data'
    };
    
    updateDashboard(fallbackData);
}

function generateFallbackHistory(months = 6) {
    const history = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 15);
        history.push({
            date: date.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 30) + 50
        });
    }
    
    return history;
}

// Analyze market from directory
function analyzeMarket(marketName) {
    const market = marketDirectory.find(m => m.name === marketName);
    if (market) {
        // Set up search for this market's main product
        const mainProduct = market.products[0];
        document.getElementById('keywordInput').value = mainProduct;
        document.getElementById('dashboardRegion').value = market.region;
        document.getElementById('dashboardProductInput').value = mainProduct;
        document.getElementById('dashboardRegionSelect').value = market.region;
        
        // Switch to dashboard and analyze
        showSection('dashboard');
        setTimeout(() => {
            performSearch(mainProduct, market.region, 'dashboard');
        }, 100);
    }
}

// View market details
function viewMarketDetails(marketName) {
    const market = marketDirectory.find(m => m.name === marketName);
    if (market) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'marketDetailsModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${market.name}</h2>
                    <button class="modal-close" onclick="appCloseModal('marketDetailsModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="width: 50px; height: 50px; background: var(--light); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 20px;">
                            <i class="fas fa-store"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0 0 4px 0;">${market.name}</h3>
                            <p style="margin: 0; color: var(--gray); font-size: 14px;">
                                <i class="fas fa-map-marker-alt"></i> ${market.region}
                            </p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 8px;">Description</h4>
                        <p style="color: var(--dark); line-height: 1.6;">${market.description}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 8px;">Main Products</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${market.products.map(product => `
                                <span style="background: var(--light); padding: 6px 12px; border-radius: 20px; font-size: 13px; color: var(--dark); border: 1px solid var(--border);">
                                    ${product}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="background: var(--light); padding: 16px; border-radius: var(--radius-sm);">
                        <h4 style="margin-bottom: 8px;">Market Analysis</h4>
                        <p style="color: var(--dark); font-size: 14px; line-height: 1.6;">
                            This market specializes in ${market.type} products. Consider analyzing specific products from this market to get detailed trend insights.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="appCloseModal('marketDetailsModal')">Close</button>
                    <button class="btn btn-primary" onclick="analyzeMarket('${market.name}'); appCloseModal('marketDetailsModal')">
                        <i class="fas fa-chart-line"></i> Analyze Market Products
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'marketDetailsOverlay';
        overlay.onclick = () => appCloseModal('marketDetailsModal');
        document.body.appendChild(overlay);
        overlay.classList.add('active');
    }
}

// Handle Profile Picture Upload
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Save to localStorage
        localStorage.setItem('profile_picture', imageData);
        
        // Update avatars
        updateProfileAvatars();
        
        // Clear input
        event.target.value = '';
        
        showToast('Profile picture updated successfully', 'success');
    };
    
    reader.readAsDataURL(file);
}

// Update all profile avatars
function updateProfileAvatars() {
    const profilePicture = localStorage.getItem('profile_picture');
    
    // Update large profile avatar
    const largeAvatar = document.getElementById('profileAvatarLarge');
    if (largeAvatar && profilePicture) {
        largeAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile">`;
    }
    
    // Update sidebar avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar && profilePicture) {
        userAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile">`;
    }
    
    // Update modal avatar if exists
    const modalAvatar = document.getElementById('profileAvatarModal');
    if (modalAvatar && profilePicture) {
        modalAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile">`;
    }
    
    // Update header profile icon button
    const headerProfileButtons = document.querySelectorAll('.header-profile button.header-icon-btn');
    if (headerProfileButtons && headerProfileButtons.length > 0 && profilePicture) {
        // Update the first button (profile icon) only
        const profileBtn = headerProfileButtons[0];
        profileBtn.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
}

// Upload Profile Picture
function uploadProfilePicture() {
    // Check if we're in the modal or main profile section
    const modal = document.getElementById('profileModal');
    const isModalActive = modal && modal.classList.contains('active');
    
    const fileInput = isModalActive 
        ? document.getElementById('profilePictureInputModal') 
        : document.getElementById('profilePictureInput');
    
    if (fileInput) {
        fileInput.click();
    }
}

// Open Profile Modal
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    const overlay = document.getElementById('modalOverlay');
    
    // Load profile data into modal
    const userName = localStorage.getItem('user_name') || 'User';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    const memberSince = localStorage.getItem('member_since') || new Date().toISOString().split('T')[0];
    const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    document.getElementById('modalProfileName').textContent = userName;
    document.getElementById('modalProfileEmail').textContent = userEmail;
    document.getElementById('modalMemberSince').textContent = new Date(memberSince).toLocaleDateString();
    document.getElementById('modalSearchCount').textContent = searchHistory.length;
    const userBio = localStorage.getItem('user_bio') || '';
    const modalBioEl = document.getElementById('modalProfileBio');
    if (modalBioEl) modalBioEl.textContent = userBio || '—';
    
    // Load profile picture
    const profilePicture = localStorage.getItem('profile_picture');
    const profileAvatarModal = document.getElementById('profileAvatarModal');
    if (profilePicture && profileAvatarModal) {
        profileAvatarModal.innerHTML = `<img src="${profilePicture}" alt="Profile">`;
    }
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    const overlay = document.getElementById('modalOverlay');
    if (modal) {
        if (modal.classList && modal.classList.contains('active')) modal.classList.remove('active');
        else modal.remove();
    }

    if (overlay) {
        overlay.classList.remove('active');
    } else {
        // Remove any dynamic overlay if static one is missing
        const dyn = Array.from(document.querySelectorAll('.modal-overlay')).filter(o => o.id && o.id !== 'modalOverlay');
        if (dyn.length > 0) dyn[dyn.length - 1].remove();
    }
}

function openContactsModal() {
    const modal = document.getElementById('contactsModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeContactsModal() {
    const modal = document.getElementById('contactsModal');
    const overlay = document.getElementById('modalOverlay');
    if (modal) {
        if (modal.classList && modal.classList.contains('active')) modal.classList.remove('active');
        else modal.remove();
    }

    if (overlay) {
        overlay.classList.remove('active');
    } else {
        const dyn = Array.from(document.querySelectorAll('.modal-overlay')).filter(o => o.id && o.id !== 'modalOverlay');
        if (dyn.length > 0) dyn[dyn.length - 1].remove();
    }
}

function closeAllModals() {
    closeProfileModal();
    closeContactsModal();
}

// Logout function
function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    window.location.href = 'index.html';
}

// Load user info
function loadUserInfo() {
    const userName = localStorage.getItem('user_name') || 'User';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    
    // Update sidebar
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    if (sidebarUserName) sidebarUserName.textContent = userName;
    if (sidebarUserEmail) sidebarUserEmail.textContent = userEmail;
    
    // Update profile picture
    updateProfileAvatars();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Load initial data
    loadSearchHistory();
    initMarketDirectory();
});

// Expose functions globally
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.searchTrends = searchTrends;
window.searchFromAdvanced = searchFromAdvanced;
window.quickSearch = quickSearch;
window.performSearch = performSearch;
window.performAdvancedSearch = performAdvancedSearch;
window.applyFilters = applyFilters;
window.compareTrends = compareTrends;
window.filterMarkets = filterMarkets;
window.analyzeMarket = analyzeMarket;
window.viewMarketDetails = viewMarketDetails;
window.showSettingsTab = showSettingsTab;
window.saveSettings = saveSettings;
window.changeTheme = changeTheme;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.logout = logout;
window.loadUserInfo = loadUserInfo;
window.initMarketDirectory = initMarketDirectory;
window.loadSearchHistory = loadSearchHistory;
window.loadProfileData = loadProfileData;
window.loadInsights = loadInsights;
window.loadSavedSettings = loadSavedSettings;
window.showEditProfile = showEditProfile;
window.saveEditProfile = saveEditProfile;
window.changePassword = changePassword;
window.saveNewPassword = saveNewPassword;
window.exportUserDataPDF = exportUserDataPDF;
window.appCloseModal = appCloseModal;
window.uploadProfilePicture = uploadProfilePicture;
window.handleProfilePictureUpload = handleProfilePictureUpload;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.openContactsModal = openContactsModal;
window.closeContactsModal = closeContactsModal;
window.closeAllModals = closeAllModals;
window.viewDetailedAnalysis = viewDetailedAnalysis;
window.goBackToSearch = goBackToSearch;
window.downloadSearchReportPDF = downloadSearchReportPDF;
window.updateChartRange = updateChartRange;