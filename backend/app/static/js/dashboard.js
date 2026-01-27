// Dashboard functionality for 2KNOW Market Trend Predictor

// Global variables
let currentChart = null;
let currentData = null;
let searchHistory = [];
let marketDirectory = [];

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('collapsed');
    overlay.classList.toggle('active');
}

// Close sidebar when clicking on a nav item
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            
            // Close sidebar if it's expanded
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                overlay.classList.remove('active');
            }
        });
    });
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Close sidebar if it's expanded
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                overlay.classList.remove('active');
            }
        });
    }
});

// Show different sections
function showSection(sectionId) {
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
    event.currentTarget.classList.add('active');
    
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

// Search trends from dashboard
async function searchTrends() {
    const keywordInput = document.getElementById('keywordInput');
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
        showToast('Please enter a product name to analyze', 'warning');
        keywordInput.focus();
        return;
    }
    
    await performSearch(keyword, 'dashboard');
}

// Search from advanced search section - STAYS IN SEARCH SECTION
async function searchFromAdvanced() {
    const keyword = document.getElementById('advancedKeyword').value.trim();
    const region = document.getElementById('regionFilter').value;
    const timeRange = document.getElementById('timeFilter').value;
    
    if (!keyword) {
        showToast('Enter a product name to analyze', 'warning');
        return;
    }
    
    // Display results in the search section, don't redirect
    await performAdvancedSearch(keyword, region, timeRange);
}

// Advanced search specific function - displays results in search section
async function performAdvancedSearch(keyword, region = 'KE', timeRange = '6') {
    showLoading(`Searching for "${keyword}" in ${region}...`);
    
    try {
        const token = localStorage.getItem('jwt_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display results in the search results area
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
            overall_score: Math.floor(Math.random() * 30) + 50
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
                <button onclick="viewDetailedAnalysis('${keyword}')">
                    <i class="fas fa-chart-line"></i> Detailed View
                </button>
                <button onclick="downloadSearchReport('${keyword}', '${region}')">
                    <i class="fas fa-download"></i> Download Report
                </button>
            </div>
        </div>
    `;
}

// View detailed analysis (stays in search section)
function viewDetailedAnalysis(keyword) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    // Generate detailed analysis data
    const analysisData = generateDetailedAnalysis(keyword);
    
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
                <p style="margin: 0; opacity: 0.9;">Comprehensive Market Analysis & Insights</p>
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
                <button onclick="downloadSearchReport('${keyword}', 'KE')" style="
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
function generateDetailedAnalysis(keyword) {
    const score = Math.floor(Math.random() * 30) + 60;
    const trends = ['📈 Rising', '📉 Declining', '→ Stable'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    const competitions = ['Low', 'Medium', 'High'];
    const competition = competitions[Math.floor(Math.random() * competitions.length)];
    const risks = ['Low', 'Medium', 'High'];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    
    return {
        overallScore: score,
        trend: trend,
        competition: competition,
        risk: risk,
        sectors: ['Agriculture', 'Electronics', 'Retail'].slice(0, Math.random() > 0.5 ? 2 : 3),
        regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].slice(0, Math.floor(Math.random() * 3) + 2),
        shortTerm: Math.floor(Math.random() * 40) + 50 + '%',
        mediumTerm: Math.floor(Math.random() * 40) + 60 + '%',
        longTerm: Math.floor(Math.random() * 40) + 70 + '%',
        recommendations: [
            'Focus on Q3-Q4 for maximum market penetration and sales volume',
            'Establish partnerships with major regional distributors first',
            'Monitor competitor activities and adjust pricing accordingly',
            'Invest in digital marketing to reach urban markets',
            'Consider seasonal variations in demand patterns',
            'Build customer loyalty programs for repeat business'
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

// Download search report
function downloadSearchReport(keyword, region) {
    const regionName = region === 'KE' ? 'Kenya' : region;
    const reportData = {
        product: keyword,
        region: regionName,
        timestamp: new Date().toLocaleString(),
        searchDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `market-search-${keyword}-${region}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Report downloaded successfully', 'success');
}

// Quick search from suggestions - stays in search section
function quickSearch(keyword) {
    const advancedKeyword = document.getElementById('advancedKeyword');
    if (advancedKeyword) {
        advancedKeyword.value = keyword;
        searchFromAdvanced();
    } else {
        // Fallback to dashboard search if not in search section
        document.getElementById('keywordInput').value = keyword;
        searchTrends();
    }
}

// Main search function
async function performSearch(keyword, source = 'dashboard') {
    showLoading('Analyzing market trends for "' + keyword + '"...');
    
    try {
        const token = localStorage.getItem('jwt_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        currentData = data;
        
        // Update dashboard with results
        updateDashboard(data);
        
        // Update search history
        addToSearchHistory(keyword, data);
        
        // Update UI based on source
        if (source === 'dashboard') {
            showToast(`Trend analysis completed for "${keyword}"`, 'success');
        } else if (source === 'search') {
            updateSearchResults(data, keyword);
        }
        
        // Update last search info
        localStorage.setItem('last_search', keyword);
        localStorage.setItem('last_search_data', JSON.stringify(data));
        
        // Update welcome banner
        document.getElementById('lastKeyword').textContent = keyword;
        document.getElementById('lastUpdate').textContent = 'Just now';
        document.getElementById('welcomeBanner').style.display = 'block';
        document.getElementById('quickStats').style.display = 'flex';
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Failed to fetch trend data. Please try again.', 'error');
        
        // Fallback to demo data for testing
        if (error.message.includes('API error')) {
            useFallbackData(keyword);
        }
    } finally {
        hideLoading();
    }
}

// Update dashboard with search results
function updateDashboard(data) {
    // Update stats
    document.getElementById('liveScore').textContent = data.live_trend_score || '--';
    document.getElementById('marketSector').textContent = data.market_sector || '--';
    document.getElementById('hotMarkets').textContent = data.relevant_markets ? data.relevant_markets.length : 0;
    document.getElementById('overallScore').textContent = data.overall_score || '--';
    
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
            description: data.relevant_markets && data.relevant_markets.length > 0 ?
                `Focus on ${data.relevant_markets.slice(0, 2).join(' and ')}` :
                'Nairobi and Mombasa markets show highest activity'
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
                <button onclick="downloadReport('${keyword}')">
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
        timestamp: new Date().toISOString(),
        score: data.overall_score || 0,
        sector: data.market_sector || 'General'
    };
    
    // Remove if already exists
    const filtered = history.filter(item => item.keyword !== keyword);
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
    
    historyList.innerHTML = searchHistory.map((item, index) => `
        <div class="history-item" onclick="quickSearch('${item.keyword}')">
            <div class="history-keyword">
                <i class="fas fa-search"></i>
                <span>${item.keyword}</span>
            </div>
            <div class="history-details">
                <span class="history-score">
                    <i class="fas fa-chart-bar"></i> ${item.score}%
                </span>
                <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
            </div>
        </div>
    `).join('');
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
    
    showLoading(`Comparing ${trend1} vs ${trend2}...`);
    
    try {
        // Fetch data for both products
        const [data1, data2] = await Promise.all([
            fetchTrendData(trend1),
            fetchTrendData(trend2)
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
async function fetchTrendData(keyword) {
    const token = localStorage.getItem('jwt_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_URL}/trends/${encodeURIComponent(keyword)}`, {
        headers: headers
    });
    
    if (!response.ok) {
        throw new Error(`API error for ${keyword}: ${response.status}`);
    }
    
    return await response.json();
}

// Load market directory
function initMarketDirectory() {
    marketDirectory = [
        // NAIROBI - Major Markets
        {
            name: "Wakulima Market",
            region: "Nairobi",
            type: "agriculture",
            description: "Largest fresh produce distribution market in East Africa, wholesale hub for vegetables, fruits and grains",
            products: ["Vegetables", "Fruits", "Grains", "Spices", "Wholesale Produce"]
        },
        {
            name: "Kariakor Market",
            region: "Nairobi",
            type: "general",
            description: "Established general market with mixed goods, textiles, clothing and household items",
            products: ["Textiles", "Clothing", "Household Items", "Cooking Utensils"]
        },
        {
            name: "Gikomba Market",
            region: "Nairobi",
            type: "clothing",
            description: "Africa's largest second-hand clothing market with wide variety of used apparel",
            products: ["Second-hand Clothes", "Shoes", "Accessories", "Vintage Items"]
        },
        {
            name: "Biashara Street",
            region: "Nairobi",
            type: "electronics",
            description: "Premier electronics hub for phones, computers, and tech accessories",
            products: ["Mobile Phones", "Computers", "Electronics", "Tech Accessories"]
        },
        {
            name: "City Market",
            region: "Nairobi",
            type: "general",
            description: "Historic central market offering fresh produce, meat, spices and household goods",
            products: ["Fresh Produce", "Meat", "Fish", "Spices", "Dairy"]
        },
        // MOMBASA - Coastal Markets
        {
            name: "Mwembe Tayari Market",
            region: "Mombasa",
            type: "general",
            description: "Major coastal trading center for spices, fish, textiles and imported goods",
            products: ["Spices", "Fish", "Seafood", "Textiles", "Clothing"]
        },
        {
            name: "Mombasa Fish Market",
            region: "Mombasa",
            type: "agriculture",
            description: "Principal fish and seafood market serving the coastal region",
            products: ["Fish", "Seafood", "Octopus", "Shellfish", "Dried Fish"]
        },
        // KISUMU - Lake Region
        {
            name: "Kisumu Main Market",
            region: "Kisumu",
            type: "agriculture",
            description: "Lake region agricultural hub specializing in fish, rice and fresh produce",
            products: ["Fish", "Rice", "Vegetables", "Fruits", "Lake Produce"]
        },
        // NAKURU - Rift Valley
        {
            name: "Nakuru Market",
            region: "Nakuru",
            type: "agriculture",
            description: "Rift Valley produce market for dairy products, cereals and horticultural goods",
            products: ["Dairy", "Cereals", "Vegetables", "Fruits", "Eggs"]
        },
        // ELDORET - Trans Nzoia
        {
            name: "Eldoret Market",
            region: "Eldoret",
            type: "agriculture",
            description: "Major grain trading center for maize, wheat and agricultural produce",
            products: ["Maize", "Wheat", "Cereals", "Livestock Feed", "Grains"]
        },
        // KISII - South Western
        {
            name: "Kisii Main Market",
            region: "Kisii",
            type: "general",
            description: "Regional market known for soapstone, agricultural produce and textiles",
            products: ["Soapstone", "Vegetables", "Fruits", "Textiles", "Crafts"]
        },
        // KERICHO - Tea Region
        {
            name: "Kericho Market",
            region: "Kericho",
            type: "agriculture",
            description: "Tea region market serving tea farmers and agricultural traders",
            products: ["Tea", "Coffee", "Vegetables", "Dairy", "Agricultural Products"]
        },
        // NYERI - Central Highlands
        {
            name: "Nyeri Market",
            region: "Nyeri",
            type: "agriculture",
            description: "Central highlands agricultural market for tea, coffee and fresh produce",
            products: ["Tea", "Coffee", "Vegetables", "Fruits", "Bananas"]
        },
        // THIKA - Central Region
        {
            name: "Thika Market",
            region: "Thika",
            type: "general",
            description: "Established commercial hub between Nairobi and central highlands",
            products: ["Vegetables", "Fruits", "Textiles", "Hardware", "General Goods"]
        },
        // MACHAKOS - Eastern Region
        {
            name: "Machakos Market",
            region: "Machakos",
            type: "agriculture",
            description: "Eastern region agricultural center for vegetables, fruits and livestock",
            products: ["Vegetables", "Fruits", "Cereals", "Livestock", "Beans"]
        },
        // MERU - Eastern Highlands
        {
            name: "Meru Market",
            region: "Meru",
            type: "agriculture",
            description: "Eastern highlands market for miraa, fruits and agricultural produce",
            products: ["Miraa", "Fruits", "Vegetables", "Spices", "Nuts"]
        },
        // EMBU - Eastern Highlands
        {
            name: "Embu Market",
            region: "Embu",
            type: "agriculture",
            description: "Eastern highlands regional market for coffee, fruits and vegetables",
            products: ["Coffee", "Fruits", "Vegetables", "Cereals", "Tea"]
        },
        // KILIFI - Coastal
        {
            name: "Kilifi Market",
            region: "Kilifi",
            type: "general",
            description: "Coastal market for fish, coconut, spices and tourist goods",
            products: ["Fish", "Coconut", "Spices", "Fruits", "Crafts"]
        },
        // NAIVASHA - Rift Valley
        {
            name: "Naivasha Market",
            region: "Naivasha",
            type: "agriculture",
            description: "Horticultural hub market for flowers, vegetables and export produce",
            products: ["Flowers", "Vegetables", "Fruits", "Dairy", "Horticulture"]
        },
        // KAKAMEGA - Western Region
        {
            name: "Kakamega Market",
            region: "Kakamega",
            type: "agriculture",
            description: "Western region agricultural market for produce and livestock",
            products: ["Vegetables", "Fruits", "Cereals", "Livestock", "Cassava"]
        },
        // BUNGOMA - Western Region
        {
            name: "Bungoma Market",
            region: "Bungoma",
            type: "agriculture",
            description: "Western region market for agricultural products and livestock",
            products: ["Vegetables", "Cereals", "Fruits", "Livestock", "Maize"]
        },
        // KITALE - Trans Nzoia
        {
            name: "Kitale Market",
            region: "Kitale",
            type: "agriculture",
            description: "Major grain market and agricultural trading center",
            products: ["Maize", "Wheat", "Vegetables", "Dairy", "Grains"]
        },
        // BOMET - Tea Region
        {
            name: "Bomet Market",
            region: "Bomet",
            type: "agriculture",
            description: "Tea and agricultural products market in tea region",
            products: ["Tea", "Vegetables", "Fruits", "Cereals", "Dairy"]
        },
        // MURANGA - Central Highlands
        {
            name: "Muranga Market",
            region: "Muranga",
            type: "agriculture",
            description: "Central highlands market for pineapples, vegetables and coffee",
            products: ["Pineapples", "Vegetables", "Fruits", "Coffee", "Bananas"]
        },
        // KAJIADO - Pastoral Region
        {
            name: "Kajiado Market",
            region: "Kajiado",
            type: "general",
            description: "Pastoral region market for livestock, dairy and pastoral products",
            products: ["Livestock", "Dairy", "Hides", "Pastoral Products", "Crafts"]
        },
        // ISIOLO - Northern Region
        {
            name: "Isiolo Market",
            region: "Isiolo",
            type: "general",
            description: "Northern region trading hub for livestock and pastoral goods",
            products: ["Livestock", "Hides", "Grains", "Pastoral Products", "Spices"]
        },
        // MALINDI - Coastal
        {
            name: "Malindi Market",
            region: "Malindi",
            type: "general",
            description: "Coastal tourist market for fish, spices and craft items",
            products: ["Fish", "Seafood", "Spices", "Crafts", "Tourist Items"]
        },
        // LAMU - Island
        {
            name: "Lamu Market",
            region: "Lamu",
            type: "general",
            description: "Historic island market with traditional goods and seafood",
            products: ["Fish", "Spices", "Textiles", "Handicrafts", "Coconut"]
        }
    ];
    
    loadMarketDirectory();
}

// Load and display market directory
function loadMarketDirectory() {
    const directory = document.getElementById('marketsDirectory');
    if (!directory) return;
    
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
    
    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const cardRegion = card.getAttribute('data-region');
        const cardType = card.getAttribute('data-type');
        
        const matchesSearch = !search || name.includes(search);
        const matchesRegion = !region || cardRegion === region;
        const matchesType = !type || cardType === type;
        
        card.style.display = matchesSearch && matchesRegion && matchesType ? 'block' : 'none';
    });
}

// Load profile data
function loadProfileData() {
    const userName = localStorage.getItem('user_name') || 'User';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileEmail').textContent = userEmail;
    
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
    
    activityList.innerHTML = history.slice(0, 5).map(item => `
        <div class="activity-item">
            <i class="fas fa-search"></i>
            <div class="activity-details">
                <div class="activity-text">Searched for "${item.keyword}"</div>
                <div class="activity-time">${formatTimeAgo(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
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
    // This would normally fetch from backend
    // For now, generate based on search history
    
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    if (history.length > 0) {
        // Calculate opportunity score based on recent searches
        const recentScore = history.length > 0 ? history[0].score : 50;
        document.getElementById('opportunityScore').textContent = recentScore + '%';
        
        // Generate time recommendation
        const now = new Date();
        const month = now.getMonth();
        const bestTime = month >= 9 && month <= 11 ? 'Oct-Dec (Peak Season)' : 'Good time to invest';
        document.getElementById('bestTime').textContent = bestTime;
        
        // Update prediction details with dynamic insights
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

// Edit Profile
// Upload Profile Picture
function uploadProfilePicture() {
    const fileInput = document.getElementById('profilePictureInput');
    fileInput.click();
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
    
    if (profilePicture) {
        // Update large profile avatar
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) {
            largeAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        
        // Update sidebar avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        
        // Update header avatar
        const headerProfileAvatar = document.getElementById('headerProfileAvatar');
        if (headerProfileAvatar) {
            headerProfileAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }
}

// Edit Profile - Show modal
function showEditProfile() {
    const userName = localStorage.getItem('user_name') || '';
    const userEmail = localStorage.getItem('user_email') || '';
    
    // Create modal for edit profile
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editProfileModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Profile</h2>
                <button class="modal-close" onclick="closeModal('editProfileModal')">
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
                        <label for="editBio">Bio</label>
                        <textarea id="editBio" class="form-input" rows="4" placeholder="Tell us about yourself..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editProfileModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveEditProfile()">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
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
    
    // Close modal first, then show toast
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.remove();
    }
    
    showToast('Profile updated successfully', 'success');
}

// Change Password
function changePassword() {
    // Create modal for change password
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'changePasswordModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Change Password</h2>
                <button class="modal-close" onclick="closeModal('changePasswordModal')">
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
                <button class="btn btn-secondary" onclick="closeModal('changePasswordModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveNewPassword()">Update Password</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
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
    
    // Close modal first
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.remove();
    }
    
    showLoading('Updating password...');
    
    // Send to backend
    const token = localStorage.getItem('jwt_token');
    fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then(response => {
        if (response.ok) {
            hideLoading();
            showToast('Password changed successfully', 'success');
        } else if (response.status === 401) {
            hideLoading();
            showToast('Current password is incorrect', 'error');
        } else {
            throw new Error('Failed to change password');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Password change error:', error);
        showToast('Error changing password. Try again later.', 'error');
    });
}

// Export User Data
function exportUserData() {
    showLoading('Preparing your data...');
    
    try {
        const userData = {
            profile: {
                name: localStorage.getItem('user_name') || 'N/A',
                email: localStorage.getItem('user_email') || 'N/A',
                bio: localStorage.getItem('user_bio') || 'N/A',
                memberSince: localStorage.getItem('member_since') || new Date().toISOString()
            },
            searchHistory: JSON.parse(localStorage.getItem('search_history') || '[]'),
            preferences: {
                theme: localStorage.getItem('app_theme') || 'light',
                region: localStorage.getItem('app_region') || 'Kenya',
                language: localStorage.getItem('app_language') || 'English'
            },
            exportDate: new Date().toISOString(),
            dataFormat: '2KNOW User Export v1.0'
        };
        
        hideLoading();
        
        // Show confirmation with format options
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'exportConfirmModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Export Your Data</h2>
                    <button class="modal-close" onclick="closeModal('exportConfirmModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="export-info">
                        <p><strong>Your export includes:</strong></p>
                        <ul>
                            <li>Profile information</li>
                            <li>Search history (${userData.searchHistory.length} searches)</li>
                            <li>User preferences</li>
                        </ul>
                        <p class="export-note">Choose your preferred format:</p>
                        <div style="display: flex; gap: 12px; margin-top: 16px;">
                            <button class="btn btn-primary" style="flex: 1;" onclick="downloadUserDataPDF()">
                                <i class="fas fa-file-pdf"></i> PDF Format
                            </button>
                            <button class="btn btn-secondary" style="flex: 1;" onclick="downloadUserDataJSON()">
                                <i class="fas fa-file-code"></i> JSON Format
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('exportConfirmModal')">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Store data temporarily for download
        window.tempExportData = userData;
    } catch (error) {
        hideLoading();
        showToast('Error preparing export', 'error');
    }
}

// Download as PDF
function downloadUserDataPDF() {
    const userData = window.tempExportData;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPosition = 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 7;
        const leftMargin = 15;
        const rightMargin = 15;
        const maxWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
        
        // Title
        doc.setFontSize(20);
        doc.text('2KNOW User Data Export', leftMargin, yPosition);
        yPosition += 15;
        
        // Export date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Export Date: ${new Date(userData.exportDate).toLocaleString()}`, leftMargin, yPosition);
        yPosition += 10;
        
        // Profile Section
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Profile Information', leftMargin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Name: ${userData.profile.name}`, leftMargin, yPosition);
        yPosition += lineHeight;
        doc.text(`Email: ${userData.profile.email}`, leftMargin, yPosition);
        yPosition += lineHeight;
        doc.text(`Bio: ${userData.profile.bio}`, leftMargin, yPosition);
        yPosition += lineHeight;
        doc.text(`Member Since: ${new Date(userData.profile.memberSince).toLocaleDateString()}`, leftMargin, yPosition);
        yPosition += 12;
        
        // Preferences Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Preferences', leftMargin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Theme: ${userData.preferences.theme}`, leftMargin, yPosition);
        yPosition += lineHeight;
        doc.text(`Region: ${userData.preferences.region}`, leftMargin, yPosition);
        yPosition += lineHeight;
        doc.text(`Language: ${userData.preferences.language}`, leftMargin, yPosition);
        yPosition += 12;
        
        // Search History Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Search History (${userData.searchHistory.length} searches)`, leftMargin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        userData.searchHistory.forEach((search, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            
            const searchText = `${index + 1}. "${search.keyword}" - ${new Date(search.timestamp).toLocaleDateString()} (Score: ${search.score}%)`;
            const wrappedText = doc.splitTextToSize(searchText, maxWidth);
            doc.text(wrappedText, leftMargin, yPosition);
            yPosition += wrappedText.length * lineHeight + 2;
        });
        
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('This is a secure export of your 2KNOW account data', leftMargin, pageHeight - 10);
        
        // Download
        const fileName = `2know-user-export-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        const modal = document.getElementById('exportConfirmModal');
        if (modal) {
            modal.remove();
        }
        
        showToast('Your data has been exported as PDF successfully', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Error generating PDF. Please try JSON format.', 'error');
    }
}

// Download as JSON (renamed from downloadUserData)
function downloadUserDataJSON() {
    const userData = window.tempExportData;
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `2know-user-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    const modal = document.getElementById('exportConfirmModal');
    if (modal) {
        modal.remove();
    }
    
    showToast('Your data has been exported as JSON successfully', 'success');
}

// Keep original function name for backward compatibility
function downloadUserData() {
    downloadUserDataJSON();
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Show settings tab (FIXED - accepts event parameter)
function showSettingsTab(tabId, event) {
    // Update tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Check if event exists and has currentTarget
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Fallback: find the clicked button
        const clickedTab = document.querySelector(`button[onclick*="showSettingsTab('${tabId}'"]`);
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
    
    showToast('Settings saved successfully', 'success');
}

// Change theme
function changeTheme() {
    const theme = document.getElementById('themeSetting').value;
    if (window.applyTheme) {
        window.applyTheme(theme);
    }
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

// Apply filters (for search section) - works independently
function applyFilters() {
    const keyword = document.getElementById('advancedKeyword').value.trim();
    const region = document.getElementById('regionFilter').value;
    const timeRange = document.getElementById('timeFilter').value;
    
    if (!keyword) {
        showToast('Please enter a product name first', 'warning');
        return;
    }
    
    // Perform search with filters
    performAdvancedSearch(keyword, region, timeRange);
}

// Download chart data
function downloadChartData() {
    if (!currentData) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `2know-${currentData.keyword}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully', 'success');
}

// Fallback data for testing
function useFallbackData(keyword) {
    const fallbackData = {
        keyword: keyword,
        live_trend_score: Math.floor(Math.random() * 30) + 50,
        historical_trends: generateFallbackHistory(),
        market_sector: keyword.includes('maize') ? 'Agriculture' : 
                      keyword.includes('phone') ? 'Electronics' :
                      keyword.includes('car') ? 'Automotive' : 'General',
        relevant_markets: ['Nairobi Market', 'Mombasa', 'Kisumu', 'Nakuru'].slice(0, Math.floor(Math.random() * 3) + 2),
        overall_score: Math.floor(Math.random() * 30) + 50,
        data_source: 'Demo Data (Backend API not responding)',
        country: 'Kenya'
    };
    
    updateDashboard(fallbackData);
    showToast('Using demo data - check backend connection', 'warning');
}

function generateFallbackHistory() {
    const history = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 15);
        history.push({
            date: date.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 30) + 50
        });
    }
    
    return history;
}

// Prevent naming conflicts with markets.js
window.dashboardShowToast = showToast;
window.dashboardShowLoading = showLoading;
window.dashboardHideLoading = hideLoading;

// Export functions for use by markets.js
window.performSearch = performSearch;
window.searchTrends = searchTrends;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    loadSearchHistory();
});
// Expose functions globally for HTML event handlers
window.showSection = showSection;
window.searchTrends = searchTrends;
window.searchFromAdvanced = searchFromAdvanced;
window.quickSearch = quickSearch;
window.performSearch = performSearch;
window.showSettingsTab = showSettingsTab;
window.saveSettings = saveSettings;
// Modal Functions
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
    
    // Load profile picture
    const profilePicture = localStorage.getItem('profile_picture');
    const profileAvatarModal = document.getElementById('profileAvatarModal');
    if (profilePicture && profileAvatarModal) {
        profileAvatarModal.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    const overlay = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    overlay.classList.remove('active');
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
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

function closeAllModals() {
    closeProfileModal();
    closeContactsModal();
}

// Expose functions to window
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.openContactsModal = openContactsModal;
window.closeContactsModal = closeContactsModal;
window.closeAllModals = closeAllModals;

window.changeTheme = changeTheme;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.logout = logout;
window.loadUserInfo = loadUserInfo;
window.initChart = initChart;
window.initMarketDirectory = initMarketDirectory;
window.loadSearchHistory = loadSearchHistory;
window.loadProfileData = loadProfileData;
window.loadInsights = loadInsights;
window.loadSavedSettings = loadSavedSettings;
window.showEditProfile = showEditProfile;
window.saveEditProfile = saveEditProfile;
window.changePassword = changePassword;
window.saveNewPassword = saveNewPassword;
window.exportUserData = exportUserData;
window.downloadUserData = downloadUserData;
window.downloadUserDataPDF = downloadUserDataPDF;
window.downloadUserDataJSON = downloadUserDataJSON;
window.closeModal = closeModal;