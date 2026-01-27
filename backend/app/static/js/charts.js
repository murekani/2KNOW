// Chart.js functionality for 2KNOW

let trendChart = null;
let comparisonChart1 = null;
let comparisonChart2 = null;
let predictionChart = null;

// Initialize main chart
function initChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Market Interest',
                data: [],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4F46E5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', Roboto, sans-serif"
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        color: '#4B5563'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Interest Score',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        color: '#4B5563'
                    },
                    grid: {
                        borderDash: [5, 5],
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear'
                }
            }
        }
    });
}

// Update chart with data
function updateTrendChart(historicalData, keyword = 'Product') {
    if (!trendChart || !historicalData || historicalData.length === 0) {
        console.warn('No chart or data available');
        return;
    }
    
    // Sort data by date
    historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract labels and values
    const labels = historicalData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    
    const values = historicalData.map(item => item.value);
    
    // Update chart
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = values;
    trendChart.data.datasets[0].label = `${keyword} Market Interest`;
    
    // Update colors based on trend
    const lastValue = values[values.length - 1] || 0;
    const firstValue = values[0] || 0;
    
    if (lastValue > firstValue) {
        // Positive trend
        trendChart.data.datasets[0].borderColor = '#10B981';
        trendChart.data.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.1)';
        trendChart.data.datasets[0].pointBackgroundColor = '#10B981';
    } else if (lastValue < firstValue) {
        // Negative trend
        trendChart.data.datasets[0].borderColor = '#EF4444';
        trendChart.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.1)';
        trendChart.data.datasets[0].pointBackgroundColor = '#EF4444';
    }
    
    trendChart.update();
}

// Update chart range
function updateChartRange() {
    const timeRange = document.getElementById('timeRange').value;
    // In production, this would fetch new data from backend
    // For now, we'll just update the display
    
    const months = parseInt(timeRange);
    const message = `Showing last ${months} months of data`;
    showToast(message, 'info');
    
    // If we have current data, we could filter it here
    if (currentData && currentData.historical_trends) {
        // Filter to show only last N months
        const filtered = currentData.historical_trends.slice(-months);
        updateTrendChart(filtered, currentData.keyword);
    }
}

// Update chart statistics
function updateChartStats(historicalData) {
    if (!historicalData || historicalData.length === 0) return;
    
    const values = historicalData.map(item => item.value);
    const peak = Math.max(...values);
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    
    // Calculate trend direction
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trendDirection = 'Stable';
    let trendColor = '#6B7280';
    
    if (avgSecond > avgFirst + 5) {
        trendDirection = 'Rising ↑';
        trendColor = '#10B981';
    } else if (avgSecond < avgFirst - 5) {
        trendDirection = 'Declining ↓';
        trendColor = '#EF4444';
    }
    
    // Update UI
    const peakElement = document.getElementById('peakValue');
    const avgElement = document.getElementById('avgValue');
    const trendElement = document.getElementById('trendDirection');
    
    if (peakElement) peakElement.textContent = peak + '%';
    if (avgElement) avgElement.textContent = average + '%';
    if (trendElement) {
        trendElement.textContent = trendDirection;
        trendElement.style.color = trendColor;
        trendElement.style.fontWeight = '600';
    }
}

// Initialize comparison charts
function initComparisonCharts() {
    const ctx1 = document.getElementById('trendChart1')?.getContext('2d');
    const ctx2 = document.getElementById('trendChart2')?.getContext('2d');
    
    if (ctx1) {
        comparisonChart1 = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Product 1',
                    data: [],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions('Product 1 Trend')
        });
    }
    
    if (ctx2) {
        comparisonChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Product 2',
                    data: [],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions('Product 2 Trend')
        });
    }
}

// Update comparison charts
function updateComparisonCharts(data1, data2) {
    if (!comparisonChart1 || !comparisonChart2) {
        initComparisonCharts();
    }
    
    // Update chart 1
    if (data1.historical_trends && comparisonChart1) {
        const sorted1 = [...data1.historical_trends].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels1 = sorted1.map(item => 
            new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
        );
        const values1 = sorted1.map(item => item.value);
        
        comparisonChart1.data.labels = labels1;
        comparisonChart1.data.datasets[0].data = values1;
        comparisonChart1.data.datasets[0].label = data1.keyword;
        comparisonChart1.update();
    }
    
    // Update chart 2
    if (data2.historical_trends && comparisonChart2) {
        const sorted2 = [...data2.historical_trends].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels2 = sorted2.map(item => 
            new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
        );
        const values2 = sorted2.map(item => item.value);
        
        comparisonChart2.data.labels = labels2;
        comparisonChart2.data.datasets[0].data = values2;
        comparisonChart2.data.datasets[0].label = data2.keyword;
        comparisonChart2.update();
    }
}

// Update comparison insights
function updateComparisonInsights(data1, data2) {
    const insightsContainer = document.getElementById('comparisonInsights');
    if (!insightsContainer) return;
    
    const score1 = data1.overall_score || 0;
    const score2 = data2.overall_score || 0;
    const trend1 = data1.live_trend_score || 0;
    const trend2 = data2.live_trend_score || 0;
    const diff = Math.abs(score1 - score2);
    
    // Determine winner
    const winner = score1 > score2 ? data1.keyword : data2.keyword;
    const winnerScore = Math.max(score1, score2);
    
    // Calculate market sectors if available
    const sector1 = data1.market_sector || 'General';
    const sector2 = data2.market_sector || 'General';
    
    // Determine trend direction
    const getTrendIcon = (trend) => trend >= 60 ? '↑' : trend >= 40 ? '→' : '↓';
    const getTrendColor = (trend) => trend >= 60 ? '#10B981' : trend >= 40 ? '#F59E0B' : '#EF4444';
    
    let insight = '';
    if (diff < 10) {
        insight = 'Both products show similar market potential - choose based on your expertise';
    } else if (score1 > score2) {
        insight = `${data1.keyword} has ${diff}% higher market potential. Strong opportunity window.`;
    } else {
        insight = `${data2.keyword} has ${diff}% higher market potential. Recommended choice.`;
    }
    
    insightsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <!-- Product 1 Card -->
            <div style="
                background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(79, 70, 229, 0.05));
                border: 2px solid #4F46E5;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <h4 style="font-size: 16px; font-weight: 700; color: #4F46E5; margin: 0;">${data1.keyword}</h4>
                    <span style="background: #4F46E5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${sector1}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 32px; font-weight: 800; color: #4F46E5;">${score1}%</div>
                    <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Market Score</div>
                </div>
                <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Live Trend: ${trend1}%</div>
                    <div style="height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(90deg, #4F46E5, #818cf8); width: ${trend1}%; transition: all 0.5s;"></div>
                    </div>
                </div>
                <div style="font-size: 13px; color: #4F46E5; font-weight: 600;">
                    Trend: ${getTrendIcon(trend1)} ${trend1 >= 60 ? 'Rising' : trend1 >= 40 ? 'Stable' : 'Declining'}
                </div>
            </div>
            
            <!-- Winner Badge -->
            <div style="
                background: linear-gradient(135deg, #f093fb, #f5576c);
                border-radius: 12px;
                padding: 20px;
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
            ">
                <i style="font-size: 32px; margin-bottom: 12px;">🏆</i>
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">LEADING PRODUCT</div>
                <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">${winner}</div>
                <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                    ${winnerScore}% Score
                </div>
                <div style="font-size: 12px; margin-top: 12px; opacity: 0.85; line-height: 1.6;">
                    ${insight}
                </div>
            </div>
            
            <!-- Product 2 Card -->
            <div style="
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
                border: 2px solid #10B981;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <h4 style="font-size: 16px; font-weight: 700; color: #10B981; margin: 0;">${data2.keyword}</h4>
                    <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${sector2}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 32px; font-weight: 800; color: #10B981;">${score2}%</div>
                    <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Market Score</div>
                </div>
                <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Live Trend: ${trend2}%</div>
                    <div style="height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(90deg, #10B981, #6ee7b7); width: ${trend2}%; transition: all 0.5s;"></div>
                    </div>
                </div>
                <div style="font-size: 13px; color: #10B981; font-weight: 600;">
                    Trend: ${getTrendIcon(trend2)} ${trend2 >= 60 ? 'Rising' : trend2 >= 40 ? 'Stable' : 'Declining'}
                </div>
            </div>
        </div>
    `;
}

// Initialize prediction chart
function initPredictionChart() {
    const ctx = document.getElementById('predictionChart')?.getContext('2d');
    if (!ctx) return;
    
    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Predicted Trend',
                data: [65, 68, 72, 70],
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                borderDash: [5, 5]
            }]
        },
        options: getChartOptions('30-Day Prediction')
    });
}

// Generic chart options
function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };
}

// Load trend comparisons
function loadTrendComparisons() {
    // Initialize charts if needed
    if (!comparisonChart1 || !comparisonChart2) {
        initComparisonCharts();
    }
    
    // Load prediction chart
    if (!predictionChart) {
        initPredictionChart();
    }
    
    // Load any existing comparison data
    const lastComparison = localStorage.getItem('last_comparison');
    if (lastComparison) {
        const data = JSON.parse(lastComparison);
        updateComparisonCharts(data.product1, data.product2);
        updateComparisonInsights(data.product1, data.product2);
    }
}
// Expose functions globally
window.initChart = initChart;
window.updateTrendChart = updateTrendChart;
window.updateChartStats = updateChartStats;
window.updateChartRange = updateChartRange;
window.loadTrendComparisons = loadTrendComparisons;
