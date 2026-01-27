// Markets functionality for 2KNOW

// Market data for Kenya (can be extended from backend later)
const kenyanMarkets = [
    {
        id: 1,
        name: "Wakulima Market",
        region: "Nairobi",
        type: "agriculture",
        description: "Largest agricultural market in Nairobi, known for fresh produce",
        products: ["Vegetables", "Fruits", "Grains", "Spices", "Livestock"],
        location: "Nairobi CBD",
        established: "1960",
        size: "Large",
        activity: "Very High",
        bestFor: ["Fresh Produce", "Wholesale", "Export Quality"],
        contact: "N/A",
        hours: "6:00 AM - 6:00 PM",
        popularity: 95
    },
    // ... (rest of the market data remains the same)
];

// Initialize market directory
function initMarketDirectory() {
    renderMarketDirectory();
    setupMarketFilters();
}

// Render market directory
function renderMarketDirectory(filteredMarkets = null) {
    const directory = document.getElementById('marketsDirectory');
    if (!directory) return;
    
    const markets = filteredMarkets || kenyanMarkets;
    
    if (markets.length === 0) {
        directory.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No markets found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    directory.innerHTML = markets.map(market => `
        <div class="market-card" data-region="${market.region}" data-type="${market.type}">
            <div class="market-card-header">
                <h4>${market.name}</h4>
                <span class="market-popularity" title="Popularity">
                    <i class="fas fa-star"></i> ${market.popularity}%
                </span>
            </div>
            
            <div class="market-info">
                <div class="market-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${market.region} • ${market.location}</span>
                </div>
                
                <div class="market-type">
                    <span class="type-badge ${market.type}">
                        ${market.type.charAt(0).toUpperCase() + market.type.slice(1)}
                    </span>
                    <span class="market-size">${market.size} Market</span>
                </div>
                
                <p class="market-description">${market.description}</p>
                
                <div class="market-products">
                    <strong><i class="fas fa-tags"></i> Main Products:</strong>
                    <div class="product-tags">
                        ${market.products.slice(0, 3).map(product => 
                            `<span class="product-tag">${product}</span>`
                        ).join('')}
                        ${market.products.length > 3 ? 
                            `<span class="more-tag">+${market.products.length - 3} more</span>` : ''
                        }
                    </div>
                </div>
                
                <div class="market-details">
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${market.hours}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Activity: ${market.activity}</span>
                    </div>
                </div>
                
                <div class="market-best-for">
                    <strong>Best for:</strong>
                    <div class="best-tags">
                        ${market.bestFor.slice(0, 2).map(item => 
                            `<span class="best-tag">${item}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="market-actions">
                <button class="market-action-btn primary" onclick="analyzeMarket('${market.name}')">
                    <i class="fas fa-chart-line"></i> Analyze Trends
                </button>
                <button class="market-action-btn secondary" onclick="showMarketDetails(${market.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `).join('');
}

// Setup market filters
function setupMarketFilters() {
    const regionFilter = document.getElementById('marketRegion');
    const typeFilter = document.getElementById('marketType');
    const searchInput = document.getElementById('marketSearch');
    
    if (regionFilter) {
        // Get unique regions
        const regions = [...new Set(kenyanMarkets.map(m => m.region))];
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }
    
    // Set up filter events
    [regionFilter, typeFilter, searchInput].forEach(element => {
        if (element) {
            element.addEventListener('change', filterMarkets);
            element.addEventListener('input', filterMarkets);
        }
    });
}

// Filter markets based on criteria
function filterMarkets() {
    const searchTerm = document.getElementById('marketSearch')?.value.toLowerCase() || '';
    const region = document.getElementById('marketRegion')?.value || '';
    const type = document.getElementById('marketType')?.value || '';
    
    const filtered = kenyanMarkets.filter(market => {
        const matchesSearch = searchTerm === '' || 
            market.name.toLowerCase().includes(searchTerm) ||
            market.description.toLowerCase().includes(searchTerm) ||
            market.products.some(p => p.toLowerCase().includes(searchTerm));
        
        const matchesRegion = region === '' || market.region === region;
        const matchesType = type === '' || market.type === type;
        
        return matchesSearch && matchesRegion && matchesType;
    });
    
    renderMarketDirectory(filtered);
    updateResultsCount(filtered.length);
}

// Update results count
function updateResultsCount(count) {
    const countElement = document.getElementById('resultsCount');
    if (!countElement) return;
    
    countElement.textContent = `${count} market${count !== 1 ? 's' : ''} found`;
}

// Analyze a specific market
async function analyzeMarket(marketName) {
    showLoading(`Analyzing market trends for ${marketName}...`);
    
    try {
        // For demonstration, we'll analyze common products in this market
        let searchTerm = marketName;
        
        // Extract common products from this market
        const market = kenyanMarkets.find(m => m.name === marketName);
        if (market && market.products.length > 0) {
            // Use the first product as search term
            searchTerm = market.products[0].toLowerCase();
        }
        
        // Call the main search function from dashboard.js
        if (window.performSearch) {
            await window.performSearch(searchTerm, 'markets');
            showToast(`Market analysis started for ${marketName}`, 'success');
            
            // Switch to dashboard to see results
            setTimeout(() => {
                const dashboardTab = document.querySelector('.nav-item[onclick*="dashboard"]');
                if (dashboardTab) dashboardTab.click();
            }, 500);
        } else {
            // Fallback if function not available
            document.getElementById('keywordInput').value = searchTerm;
            if (window.searchTrends) {
                window.searchTrends();
            }
        }
        
    } catch (error) {
        console.error('Market analysis error:', error);
        showToast('Failed to analyze market', 'error');
    } finally {
        hideLoading();
    }
}

// Show market details
function showMarketDetails(marketId) {
    const market = kenyanMarkets.find(m => m.id === marketId);
    if (!market) return;
    
    const modalHTML = `
        <div class="market-modal">
            <div class="modal-header">
                <h3>${market.name}</h3>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-content">
                <div class="market-summary">
                    <div class="summary-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Location</strong>
                            <p>${market.location}, ${market.region}</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <strong>Established</strong>
                            <p>${market.established}</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-expand-arrows-alt"></i>
                        <div>
                            <strong>Market Size</strong>
                            <p>${market.size}</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h4>Description</h4>
                    <p>${market.description}</p>
                </div>
                
                <div class="section">
                    <h4>Products Available</h4>
                    <div class="product-list">
                        ${market.products.map(product => `
                            <span class="product-item">${product}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section">
                    <h4>Market Details</h4>
                    <div class="detail-grid">
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>Operating Hours</strong>
                                <p>${market.hours}</p>
                            </div>
                        </div>
                        <div class="detail">
                            <i class="fas fa-chart-line"></i>
                            <div>
                                <strong>Activity Level</strong>
                                <p>${market.activity}</p>
                            </div>
                        </div>
                        <div class="detail">
                            <i class="fas fa-star"></i>
                            <div>
                                <strong>Popularity</strong>
                                <p>${market.popularity}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h4>Best For</h4>
                    <div class="best-for-list">
                        ${market.bestFor.map(item => `
                            <span class="best-for-item">${item}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section">
                    <h4>Market Insights</h4>
                    <div class="insight">
                        <i class="fas fa-lightbulb"></i>
                        <p>This market is ${getMarketInsight(market)}</p>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn primary" onclick="analyzeMarket('${market.name}')">
                    <i class="fas fa-chart-line"></i> Analyze Market Trends
                </button>
                <button class="modal-btn" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'marketModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Add CSS for modal if not already present
    addModalStyles();
}

// Get market insight
function getMarketInsight(market) {
    if (market.popularity >= 85) {
        return "one of the most popular markets in the region with consistently high traffic.";
    } else if (market.popularity >= 70) {
        return "a well-established market with steady customer flow and good variety.";
    } else {
        return "a growing market with potential for expansion and increasing popularity.";
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('marketModal');
    if (modal) {
        modal.remove();
    }
}

// Add modal styles
function addModalStyles() {
    if (document.getElementById('modalStyles')) return;
    
    const styles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
        }
        
        .market-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 24px;
            color: #1f2937;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 32px;
            color: #6b7280;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .close-modal:hover {
            background: #f3f4f6;
            color: #4b5563;
        }
        
        .modal-content {
            padding: 32px;
        }
        
        .market-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .summary-item i {
            font-size: 24px;
            color: #4f46e5;
        }
        
        .section {
            margin-bottom: 28px;
        }
        
        .section h4 {
            margin-bottom: 16px;
            color: #374151;
            font-size: 18px;
        }
        
        .product-list, .best-for-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 8px;
        }
        
        .product-item, .best-for-item {
            padding: 8px 16px;
            background: #f3f4f6;
            border-radius: 20px;
            font-size: 14px;
            color: #4b5563;
        }
        
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 12px;
        }
        
        .detail {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .detail i {
            font-size: 20px;
            color: #10b981;
        }
        
        .insight {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }
        
        .insight i {
            color: #3b82f6;
            font-size: 20px;
            margin-top: 2px;
        }
        
        .modal-actions {
            display: flex;
            gap: 12px;
            padding: 24px 32px;
            border-top: 1px solid #e5e7eb;
        }
        
        .modal-btn {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
        }
        
        .modal-btn.primary {
            background: #4f46e5;
            color: white;
        }
        
        .modal-btn.primary:hover {
            background: #3730a3;
        }
        
        .modal-btn:not(.primary) {
            background: #f3f4f6;
            color: #4b5563;
        }
        
        .modal-btn:not(.primary):hover {
            background: #e5e7eb;
        }
        
        /* Market card enhancements */
        .market-card {
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            background: white;
        }
        
        .market-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #4f46e5;
        }
        
        .market-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        
        .market-popularity {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #f59e0b;
            font-weight: 600;
            font-size: 14px;
        }
        
        .type-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: white;
        }
        
        .type-badge.agriculture { background: #10b981; }
        .type-badge.electronics { background: #3b82f6; }
        .type-badge.clothing { background: #8b5cf6; }
        .type-badge.general { background: #6b7280; }
        
        .product-tag, .best-tag {
            display: inline-block;
            padding: 4px 10px;
            background: #f3f4f6;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }
        
        .market-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .market-action-btn {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
        }
        
        .market-action-btn.primary {
            background: #4f46e5;
            color: white;
        }
        
        .market-action-btn.primary:hover {
            background: #3730a3;
        }
        
        .market-action-btn.secondary {
            background: #f3f4f6;
            color: #4b5563;
        }
        
        .market-action-btn.secondary:hover {
            background: #e5e7eb;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'modalStyles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Export market data
function exportMarketData() {
    const dataStr = JSON.stringify(kenyanMarkets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `2know-kenyan-markets-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Market data exported successfully', 'success');
}

// Helper functions (FIXED - NO RECURSION)
function showToast(message, type = 'info') {
    // Check if dashboard.js showToast exists (not recursive)
    if (typeof window.dashboardShowToast !== 'undefined') {
        window.dashboardShowToast(message, type);
        return;
    }
    
    // Fallback toast
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

function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay && loadingText) {
        loadingText.textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarketDirectory);
} else {
    initMarketDirectory();
}