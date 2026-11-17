// API Base URL
const API_BASE = '/api';

// State management
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    checkServerConnection();
    loadCrops();
});

// Check if server is running
async function checkServerConnection() {
    try {
        // Use health check endpoint first (no auth required)
        const response = await fetch('/api/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Server is running and reachable:', data.message);
            
            // Remove warning if it exists
            const warning = document.getElementById('serverWarning');
            if (warning) warning.remove();
            
            return true;
        }
    } catch (error) {
        console.error('✗ Server connection check failed:', error);
        console.error('Make sure the server is running: npm start');
        
        // Show a persistent warning if server is not reachable
        const warning = document.createElement('div');
        warning.id = 'serverWarning';
        warning.className = 'alert alert-error';
        warning.style.position = 'fixed';
        warning.style.top = '70px';
        warning.style.left = '50%';
        warning.style.transform = 'translateX(-50%)';
        warning.style.zIndex = '10000';
        warning.style.maxWidth = '500px';
        warning.style.padding = '15px';
        warning.innerHTML = `
            <strong>⚠️ Server Not Connected</strong><br>
            Cannot connect to the server. Please make sure:<br>
            1. Server is running: <code>npm start</code><br>
            2. Server is on port 3000<br>
            3. Check terminal for errors
        `;
        
        // Remove existing warning
        const existing = document.getElementById('serverWarning');
        if (existing) existing.remove();
        
        document.body.appendChild(warning);
        
        // Remove warning after 10 seconds
        setTimeout(() => {
            const warningEl = document.getElementById('serverWarning');
            if (warningEl) warningEl.remove();
        }, 10000);
        
        return false;
    }
    return true;
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Recommendation form
    document.getElementById('recommendationForm').addEventListener('submit', handleRecommendation);

    // Admin forms
    document.getElementById('cropForm').addEventListener('submit', handleCropSave);
    document.getElementById('fertilizerForm').addEventListener('submit', handleFertilizerSave);
    document.getElementById('ruleForm').addEventListener('submit', handleRuleSave);

    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
            if (tab === 'feedbacks') {
                loadAdminFeedbacks();
            }
        });
    });

    // Feedback filters
    const feedbackSort = document.getElementById('feedbackSort');
    const feedbackRatingFilter = document.getElementById('feedbackRatingFilter');
    if (feedbackSort) {
        feedbackSort.addEventListener('change', loadAdminFeedbacks);
    }
    if (feedbackRatingFilter) {
        feedbackRatingFilter.addEventListener('change', loadAdminFeedbacks);
    }

    // User navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            showPage(page);
        });
    });

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

// Show pages
function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('userInfo').textContent = '';
    document.getElementById('userNav').style.display = 'none';
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').style.display = 'block';
}

function showDashboard() {
    hideAllPages();
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('userInfo').textContent = `Welcome, ${currentUser.name} (${currentUser.role})`;
    
    if (currentUser.role === 'agronomist') {
        document.getElementById('adminDashboard').style.display = 'block';
        document.getElementById('userNav').style.display = 'none';
        loadAdminData();
    } else {
        document.getElementById('userNav').style.display = 'block';
        showPage('dashboard');
        loadUserHistory();
        loadFeedbackData();
    }
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Navigation function
function showPage(pageName) {
    hideAllPages();
    
    // Show the requested page
    const pageMap = {
        'dashboard': 'dashboardPage',
        'history': 'historyPage',
        'results': 'resultsPage',
        'feedback': 'feedbackPage'
    };
    
    const pageId = pageMap[pageName];
    if (pageId) {
        document.getElementById(pageId).style.display = 'block';
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // Load page-specific data
    if (pageName === 'history') {
        loadUserHistory();
    } else if (pageName === 'feedback') {
        loadFeedbackData();
    } else if (pageName === 'results') {
        // Results are shown when recommendation is generated
        if (!document.getElementById('recommendationResult').innerHTML) {
            document.getElementById('recommendationResult').innerHTML = 
                '<div class="alert alert-info">No recommendation results yet. Go to Dashboard to get a recommendation.</div>';
        }
    }
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
        } else {
            showAlert('loginPage', data.message, 'error');
        }
    } catch (error) {
        showAlert('loginPage', 'Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const phone = document.getElementById('registerPhone').value.trim();
    const location = document.getElementById('registerLocation').value.trim();

    // Basic client-side validation
    if (!name || name.length === 0) {
        showAlert('registerPage', 'Name is required', 'error');
        return;
    }

    if (!email || !email.includes('@')) {
        showAlert('registerPage', 'Valid email is required', 'error');
        return;
    }

    if (!password || password.length < 6) {
        showAlert('registerPage', 'Password must be at least 6 characters long', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, phone, location })
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error('Invalid response from server');
        }

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showAlert('registerPage', 'Registration successful!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            // Handle different error scenarios
            let errorMsg = 'Registration failed';
            if (data.error) {
                errorMsg = data.error;
            } else if (data.message) {
                errorMsg = data.message;
            } else if (response.status === 400) {
                errorMsg = 'Invalid registration data. Please check all fields.';
            } else if (response.status === 500) {
                errorMsg = 'Server error. Please try again later.';
            }
            
            showAlert('registerPage', errorMsg, 'error');
            console.error('Registration error:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
        }
    } catch (error) {
        console.error('Registration request error:', error);
        let errorMessage = 'Registration failed. ';
        
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            errorMessage += 'Cannot connect to server. Please make sure:\n';
            errorMessage += '1. The server is running (npm start)\n';
            errorMessage += '2. Server is running on port 3000\n';
            errorMessage += '3. Check browser console for details';
        } else {
            errorMessage += error.message;
        }
        
        showAlert('registerPage', errorMessage, 'error');
        
        // Try to ping the server
        checkServerConnection();
    } finally {
        // Restore button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    showLogin();
}

// Load crops
async function loadCrops() {
    try {
        const response = await fetch(`${API_BASE}/crops`);
        const crops = await response.json();
        
        const cropSelect = document.getElementById('cropSelect');
        cropSelect.innerHTML = '<option value="">Select Crop</option>';
        crops.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.cropId;
            option.textContent = crop.cropName;
            cropSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading crops:', error);
    }
}

// Recommendation handler
async function handleRecommendation(e) {
    e.preventDefault();
    
    const cropId = document.getElementById('cropSelect').value;
    const growthStage = document.getElementById('growthStage').value;
    const soilPh = document.getElementById('soilPh').value;
    const area = parseFloat(document.getElementById('area').value);
    const nitrogen = document.getElementById('nitrogen').value;
    const phosphorus = document.getElementById('phosphorus').value;
    const potassium = document.getElementById('potassium').value;

    if (!cropId || !growthStage || !area || !nitrogen || !phosphorus || !potassium) {
        showAlert('userDashboard', 'Please fill all required fields', 'error');
        return;
    }

    const soilInput = {
        pH: soilPh ? parseFloat(soilPh) : null,
        N: nitrogen,
        P: phosphorus,
        K: potassium
    };

    try {
        const response = await fetch(`${API_BASE}/recommendations/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                cropId,
                soilInput,
                growthStage,
                area: { value: area, unit: 'hectare' }
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayRecommendation(data.recommendation);
            loadUserHistory();
            loadFeedbackData(); // Refresh feedback dropdown
        } else {
            const errorMsg = data.error || data.message || 'Failed to get recommendation';
            showAlert('dashboardPage', errorMsg, 'error');
            console.error('Recommendation error:', data);
        }
    } catch (error) {
        console.error('Request error:', error);
        showAlert('dashboardPage', 'Failed to get recommendation: ' + error.message, 'error');
    }
}

function displayRecommendation(recommendation) {
    const resultDiv = document.getElementById('recommendationResult');
    
    let html = '<div class="recommendation-card">';
    html += '<div class="recommendation-header">';
    html += `<h3>Fertilizer Recommendations</h3>`;
    html += `<p class="rec-meta"><strong>Date:</strong> ${new Date(recommendation.createdAt).toLocaleString()}</p>`;
    html += `<p class="rec-meta"><strong>Crop:</strong> ${recommendation.cropId} | <strong>Stage:</strong> ${recommendation.growthStage}</p>`;
    html += '</div>';
    
    if (recommendation.generatedRecommendations.length === 0) {
        html += '<div class="alert alert-info">No specific recommendations found. Please consult with an agronomist.</div>';
    } else {
        recommendation.generatedRecommendations.forEach((rec, index) => {
            html += '<div class="recommendation-item">';
            html += `<div class="rec-number">${index + 1}</div>`;
            html += `<div class="rec-content">`;
            html += `<h4>${rec.fertilizerName}</h4>`;
            html += `<div class="rec-details">`;
            html += `<p><strong>Quantity:</strong> <span class="highlight">${rec.quantity} ${rec.unit}</span></p>`;
            html += `<p><strong>Timing:</strong> ${rec.timing}</p>`;
            html += `<p><strong>Instructions:</strong> ${rec.instructions}</p>`;
            html += `</div></div>`;
            html += '</div>';
        });
    }
    
    html += '<div class="rec-actions">';
    html += `<button onclick="viewRecommendation('${recommendation.recId}')" class="btn btn-primary">View Details</button>`;
    html += '<button onclick="printRecommendation()" class="btn btn-success">Download/Print</button>';
    html += '</div>';
    html += '</div>';
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    
    // Switch to results page
    showPage('results');
}

function printRecommendation() {
    window.print();
}

// Load user history
async function loadUserHistory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/recommendations/user/${currentUser.userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const recommendations = await response.json();
        
        const historyList = document.getElementById('historyList');
        if (recommendations.length === 0) {
            historyList.innerHTML = '<div class="alert alert-info">No recommendations yet. Go to Dashboard to get your first recommendation!</div>';
            return;
        }

        let html = '<div class="history-grid">';
        recommendations.forEach(rec => {
            const cropName = rec.cropId || 'Unknown Crop';
            html += '<div class="history-card">';
            html += `<div class="history-card-header">`;
            html += `<h4>${cropName}</h4>`;
            html += `<span class="history-date">${new Date(rec.createdAt).toLocaleDateString()}</span>`;
            html += `</div>`;
            html += `<div class="history-card-body">`;
            html += `<p><strong>Growth Stage:</strong> ${rec.growthStage}</p>`;
            html += `<p><strong>Area:</strong> ${rec.area.value} ${rec.area.unit}</p>`;
            html += `<p><strong>Fertilizers:</strong> ${rec.generatedRecommendations.length} recommended</p>`;
            html += `<p><strong>NPK Levels:</strong> N: ${rec.soilInput.N}, P: ${rec.soilInput.P}, K: ${rec.soilInput.K}</p>`;
            html += `</div>`;
            html += `<div class="history-card-actions">`;
            html += `<button onclick="viewRecommendationInResults('${rec.recId}')" class="btn btn-primary">View Results</button>`;
            html += `</div>`;
            html += '</div>';
        });
        html += '</div>';
        
        historyList.innerHTML = html;
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyList').innerHTML = 
            '<div class="alert alert-error">Failed to load history. Please try again.</div>';
    }
}

async function viewRecommendation(recId) {
    try {
        const response = await fetch(`${API_BASE}/recommendations/${recId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const recommendation = await response.json();
        displayRecommendation(recommendation);
    } catch (error) {
        showAlert('dashboardPage', 'Failed to load recommendation', 'error');
    }
}

async function viewRecommendationInResults(recId) {
    await viewRecommendation(recId);
    showPage('results');
}

// Admin functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    // Load data for specific tabs
    if (tab === 'feedbacks') {
        loadAdminFeedbacks();
    } else if (tab === 'crops') {
        loadAdminData();
    }
}

async function loadAdminData() {
    try {
        const response = await fetch(`${API_BASE}/kb`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        displayCrops(data.crops);
        displayFertilizers(data.fertilizers);
        displayRules(data.rules);
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Load admin feedbacks
async function loadAdminFeedbacks() {
    if (!currentUser || currentUser.role !== 'agronomist') {
        console.error('User is not an admin');
        return;
    }
    
    const feedbacksList = document.getElementById('feedbacksList');
    const feedbackStats = document.getElementById('feedbackStats');
    
    // Show loading state
    if (feedbacksList) {
        feedbacksList.innerHTML = '<div class="loading">Loading feedbacks...</div>';
    }
    if (feedbackStats) {
        feedbackStats.innerHTML = '<div class="loading">Loading statistics...</div>';
    }
    
    try {
        const sort = document.getElementById('feedbackSort')?.value || 'desc';
        const ratingFilter = document.getElementById('feedbackRatingFilter')?.value || '';
        
        let url = `${API_BASE}/admin/feedbacks?limit=100&sort=${sort}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Try to parse error response
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
            }
            
            throw new Error(errorData.error || errorData.message || `Server returned ${response.status}`);
        }

        const data = await response.json();

        if (data.feedbacks && data.statistics) {
            displayFeedbackStats(data.statistics);
            displayAdminFeedbacks(data.feedbacks, ratingFilter);
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        const errorMsg = error.message || 'Failed to load feedbacks. Please try again.';
        
        if (feedbacksList) {
            feedbacksList.innerHTML = `<div class="alert alert-error">${errorMsg}</div>`;
        }
        if (feedbackStats) {
            feedbackStats.innerHTML = `<div class="alert alert-error">Failed to load statistics</div>`;
        }
        
        // Show detailed error in console for debugging
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
    }
}

function displayFeedbackStats(stats) {
    const statsDiv = document.getElementById('feedbackStats');
    if (!statsDiv) return;
    
    const ratingStars = (rating) => {
        return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    };
    
    let html = '<div class="stats-grid">';
    html += '<div class="stat-card">';
    html += `<h4>Total Feedbacks</h4>`;
    html += `<p class="stat-value">${stats.total}</p>`;
    html += '</div>';
    
    html += '<div class="stat-card">';
    html += `<h4>Average Rating</h4>`;
    html += `<p class="stat-value">${stats.averageRating} ${ratingStars(parseFloat(stats.averageRating))}</p>`;
    html += '</div>';
    
    html += '<div class="stat-card">';
    html += `<h4>Rating Distribution</h4>`;
    html += '<div class="rating-dist">';
    for (let i = 5; i >= 1; i--) {
        const count = stats.ratingDistribution[i] || 0;
        html += `<div class="rating-bar-item">`;
        html += `${i}⭐: ${count}`;
        html += `</div>`;
    }
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    
    statsDiv.innerHTML = html;
}

function displayAdminFeedbacks(feedbacks, ratingFilter) {
    const listDiv = document.getElementById('feedbacksList');
    if (!listDiv) {
        console.error('feedbacksList element not found');
        return;
    }
    
    if (!feedbacks || !Array.isArray(feedbacks)) {
        listDiv.innerHTML = '<div class="alert alert-info">No feedbacks available.</div>';
        return;
    }
    
    // Filter by rating if specified
    let filteredFeedbacks = feedbacks;
    if (ratingFilter) {
        filteredFeedbacks = feedbacks.filter(fb => fb.rating === parseInt(ratingFilter));
    }
    
    if (filteredFeedbacks.length === 0) {
        if (ratingFilter) {
            listDiv.innerHTML = `<div class="alert alert-info">No feedbacks found with ${ratingFilter} star rating.</div>`;
        } else {
            listDiv.innerHTML = '<div class="alert alert-info">No feedbacks found. Users can submit feedback from their Feedback page.</div>';
        }
        return;
    }
    
    let html = '';
    filteredFeedbacks.forEach(feedback => {
        const rating = feedback.rating || 0;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const user = feedback.user || { name: 'Unknown User', email: 'N/A' };
        const rec = feedback.recommendation || {};
        
        html += '<div class="admin-feedback-item">';
        html += '<div class="feedback-header">';
        html += `<div class="feedback-user-info">`;
        html += `<strong>${user.name || 'Unknown'}</strong> (${user.email || 'N/A'})`;
        html += `</div>`;
        html += `<div class="feedback-rating">${stars} (${rating}/5)</div>`;
        html += `<div class="feedback-date">${feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : 'N/A'}</div>`;
        html += '</div>';
        
        if (rec && rec.cropId) {
            html += '<div class="feedback-rec-info">';
            html += `<p><strong>Recommendation:</strong> ${rec.cropId} | Stage: ${rec.growthStage || 'N/A'}</p>`;
            if (rec.area) {
                html += `<p><strong>Area:</strong> ${rec.area.value} ${rec.area.unit || 'hectare'}</p>`;
            }
            html += `</div>`;
        } else {
            html += '<div class="feedback-rec-info">';
            html += `<p class="text-muted">Recommendation details not available</p>`;
            html += '</div>';
        }
        
        if (feedback.comments && feedback.comments.trim()) {
            html += '<div class="feedback-comments">';
            html += `<p><strong>Comments:</strong></p>`;
            html += `<p>${feedback.comments}</p>`;
            html += '</div>';
        } else {
            html += '<div class="feedback-comments">';
            html += `<p class="text-muted">No comments provided</p>`;
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    listDiv.innerHTML = html;
}

function displayCrops(crops) {
    const list = document.getElementById('cropsList');
    if (!list) return;
    
    if (crops.length === 0) {
        list.innerHTML = '<div class="alert alert-info">No crops found. Click "Add New Crop" to create one.</div>';
        return;
    }

    let html = '<h4>Existing Crops</h4><div class="crops-grid">';
    crops.forEach(crop => {
        const npk = crop.typicalNPK || {};
        const fertilizers = crop.recommendedFertilizers || [];
        
        html += '<div class="crop-card">';
        html += '<div class="crop-card-header">';
        html += `<h4>${crop.cropName}</h4>`;
        html += `<span class="crop-id">ID: ${crop.cropId}</span>`;
        html += '</div>';
        
        html += '<div class="crop-card-body">';
        
        // NPK Requirements
        if (npk.N || npk.P || npk.K) {
            html += '<div class="crop-info-section">';
            html += '<strong>NPK Requirements (kg/hectare):</strong>';
            html += `<p>N: ${npk.N || 0} | P: ${npk.P || 0} | K: ${npk.K || 0}</p>`;
            html += '</div>';
        }
        
        // Recommended Fertilizers
        if (fertilizers.length > 0) {
            html += '<div class="crop-info-section">';
            html += '<strong>Recommended Fertilizers:</strong>';
            html += '<ul class="fertilizer-list">';
            fertilizers.forEach(fert => {
                const dosage = fert.dosageRules || {};
                html += '<li>';
                html += `<strong>${fert.fertilizerId}</strong> - `;
                html += `Low: ${dosage.low || 'N/A'}, Medium: ${dosage.medium || 'N/A'}, High: ${dosage.high || 'N/A'} kg/ha`;
                html += '</li>';
            });
            html += '</ul>';
            html += '</div>';
        }
        
        // Notes
        if (crop.notes) {
            html += '<div class="crop-info-section">';
            html += '<strong>Notes:</strong>';
            html += `<p>${crop.notes}</p>`;
            html += '</div>';
        }
        
        html += '</div>';
        
        html += '<div class="crop-card-actions">';
        html += `<button onclick="editCrop('${crop.cropId}')" class="btn btn-primary btn-sm">Edit</button>`;
        html += `<button onclick="deleteCrop('${crop.cropId}')" class="btn btn-danger btn-sm">Delete</button>`;
        html += `<button onclick="viewCrop('${crop.cropId}')" class="btn btn-secondary btn-sm">View Details</button>`;
        html += '</div>';
        
        html += '</div>';
    });
    html += '</div>';
    
    list.innerHTML = html;
}

// Show crop form
function showCropForm(cropId = null) {
    const formSection = document.getElementById('cropFormSection');
    const formTitle = document.getElementById('cropFormTitle');
    const addBtn = document.getElementById('addCropBtn');
    
    if (formSection) {
        formSection.style.display = 'block';
        if (cropId) {
            formTitle.textContent = 'Edit Crop';
        } else {
            formTitle.textContent = 'Add New Crop';
            document.getElementById('cropForm').reset();
            document.getElementById('cropId').value = '';
            document.getElementById('recommendedFertilizersList').innerHTML = '';
        }
        if (addBtn) addBtn.style.display = 'none';
        formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Cancel crop form
function cancelCropForm() {
    const formSection = document.getElementById('cropFormSection');
    const addBtn = document.getElementById('addCropBtn');
    
    if (formSection) {
        formSection.style.display = 'none';
        document.getElementById('cropForm').reset();
        document.getElementById('cropId').value = '';
        document.getElementById('recommendedFertilizersList').innerHTML = '';
    }
    if (addBtn) addBtn.style.display = 'inline-block';
}

// Edit crop
async function editCrop(cropId) {
    try {
        const response = await fetch(`${API_BASE}/kb`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        const crop = data.crops.find(c => c.cropId === cropId);
        
        if (!crop) {
            showAlert('adminDashboard', 'Crop not found', 'error');
            return;
        }
        
        // Fill form with crop data
        document.getElementById('cropId').value = crop.cropId;
        document.getElementById('cropName').value = crop.cropName || '';
        document.getElementById('cropN').value = crop.typicalNPK?.N || '';
        document.getElementById('cropP').value = crop.typicalNPK?.P || '';
        document.getElementById('cropK').value = crop.typicalNPK?.K || '';
        document.getElementById('cropNotes').value = crop.notes || '';
        
        // Load recommended fertilizers
        displayCropFertilizers(crop.recommendedFertilizers || []);
        
        showCropForm(cropId);
    } catch (error) {
        console.error('Error loading crop:', error);
        showAlert('adminDashboard', 'Failed to load crop data', 'error');
    }
}

// View crop details
async function viewCrop(cropId) {
    try {
        const response = await fetch(`${API_BASE}/kb`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        const crop = data.crops.find(c => c.cropId === cropId);
        
        if (!crop) {
            showAlert('adminDashboard', 'Crop not found', 'error');
            return;
        }
        
        const npk = crop.typicalNPK || {};
        const fertilizers = crop.recommendedFertilizers || [];
        
        let details = `<h3>${crop.cropName} (${crop.cropId})</h3>`;
        details += `<p><strong>NPK Requirements:</strong> N: ${npk.N || 0}, P: ${npk.P || 0}, K: ${npk.K || 0} kg/hectare</p>`;
        
        if (fertilizers.length > 0) {
            details += '<p><strong>Recommended Fertilizers:</strong></p><ul>';
            fertilizers.forEach(fert => {
                const dosage = fert.dosageRules || {};
                details += `<li>${fert.fertilizerId}: Low=${dosage.low || 'N/A'}, Medium=${dosage.medium || 'N/A'}, High=${dosage.high || 'N/A'} kg/ha</li>`;
            });
            details += '</ul>';
        }
        
        if (crop.notes) {
            details += `<p><strong>Notes:</strong> ${crop.notes}</p>`;
        }
        
        alert(details);
    } catch (error) {
        console.error('Error viewing crop:', error);
        showAlert('adminDashboard', 'Failed to load crop details', 'error');
    }
}

// Delete crop
async function deleteCrop(cropId) {
    if (!confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/crops/${cropId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('adminDashboard', 'Crop deleted successfully', 'success');
            loadAdminData();
        } else {
            const errorMsg = data.error || data.message || 'Failed to delete crop';
            showAlert('adminDashboard', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error deleting crop:', error);
        showAlert('adminDashboard', 'Failed to delete crop: ' + error.message, 'error');
    }
}

// Add fertilizer to crop form
let fertilizerCounter = 0;
async function addFertilizerToCrop() {
    try {
        // Load available fertilizers
        const response = await fetch(`${API_BASE}/kb`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        const fertilizers = data.fertilizers || [];
        
        if (fertilizers.length === 0) {
            showAlert('adminDashboard', 'No fertilizers available. Please add fertilizers first.', 'error');
            return;
        }
        
        const list = document.getElementById('recommendedFertilizersList');
        const fertId = 'fert_' + fertilizerCounter++;
        
        let html = '<div class="fertilizer-item" id="' + fertId + '">';
        html += '<div class="form-row">';
        html += '<select class="fertilizer-select" required>';
        html += '<option value="">Select Fertilizer</option>';
        fertilizers.forEach(fert => {
            html += `<option value="${fert.fertilizerId}">${fert.name} (${fert.fertilizerId})</option>`;
        });
        html += '</select>';
        html += '<input type="number" class="dosage-low" placeholder="Low (kg/ha)" step="0.1" min="0">';
        html += '<input type="number" class="dosage-medium" placeholder="Medium (kg/ha)" step="0.1" min="0">';
        html += '<input type="number" class="dosage-high" placeholder="High (kg/ha)" step="0.1" min="0">';
        html += '<button type="button" onclick="removeFertilizerFromCrop(\'' + fertId + '\')" class="btn btn-danger btn-sm">Remove</button>';
        html += '</div>';
        html += '</div>';
        
        list.innerHTML += html;
    } catch (error) {
        console.error('Error loading fertilizers:', error);
        showAlert('adminDashboard', 'Failed to load fertilizers', 'error');
    }
}

// Remove fertilizer from crop form
function removeFertilizerFromCrop(fertId) {
    const element = document.getElementById(fertId);
    if (element) {
        element.remove();
    }
}

// Display fertilizers in crop form
function displayCropFertilizers(fertilizers) {
    const list = document.getElementById('recommendedFertilizersList');
    list.innerHTML = '';
    
    fertilizers.forEach((fert, index) => {
        const fertId = 'fert_' + index;
        fertilizerCounter = Math.max(fertilizerCounter, index + 1);
        
        // We need to load fertilizers to get names
        fetch(`${API_BASE}/kb`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }).then(response => response.json())
        .then(data => {
            const allFerts = data.fertilizers || [];
            const fertName = allFerts.find(f => f.fertilizerId === fert.fertilizerId)?.name || fert.fertilizerId;
            
            let html = '<div class="fertilizer-item" id="' + fertId + '">';
            html += '<div class="form-row">';
            html += '<select class="fertilizer-select" required>';
            html += '<option value="">Select Fertilizer</option>';
            allFerts.forEach(f => {
                html += `<option value="${f.fertilizerId}" ${f.fertilizerId === fert.fertilizerId ? 'selected' : ''}>${f.name} (${f.fertilizerId})</option>`;
            });
            html += '</select>';
            const dosage = fert.dosageRules || {};
            html += `<input type="number" class="dosage-low" placeholder="Low (kg/ha)" step="0.1" min="0" value="${dosage.low || ''}">`;
            html += `<input type="number" class="dosage-medium" placeholder="Medium (kg/ha)" step="0.1" min="0" value="${dosage.medium || ''}">`;
            html += `<input type="number" class="dosage-high" placeholder="High (kg/ha)" step="0.1" min="0" value="${dosage.high || ''}">`;
            html += '<button type="button" onclick="removeFertilizerFromCrop(\'' + fertId + '\')" class="btn btn-danger btn-sm">Remove</button>';
            html += '</div>';
            html += '</div>';
            
            list.innerHTML += html;
        });
    });
}

function displayFertilizers(fertilizers) {
    const list = document.getElementById('fertilizersList');
    if (fertilizers.length === 0) {
        list.innerHTML = '<p>No fertilizers found.</p>';
        return;
    }

    let html = '<h4>Existing Fertilizers</h4>';
    fertilizers.forEach(fert => {
        html += `<div class="list-item">`;
        html += `<strong>${fert.name}</strong> (ID: ${fert.fertilizerId}) - ${fert.type}`;
        html += ` - NPK: ${fert.nutrientComposition.N}-${fert.nutrientComposition.P}-${fert.nutrientComposition.K}`;
        html += `</div>`;
    });
    list.innerHTML = html;
}

function displayRules(rules) {
    const list = document.getElementById('rulesList');
    if (rules.length === 0) {
        list.innerHTML = '<p>No rules found.</p>';
        return;
    }

    let html = '<h4>Existing Rules</h4>';
    rules.forEach(rule => {
        html += `<div class="list-item">`;
        html += `<strong>Rule ID:</strong> ${rule.ruleId} | <strong>Crop ID:</strong> ${rule.cropId}`;
        html += `</div>`;
    });
    list.innerHTML = html;
}

async function handleCropSave(e) {
    e.preventDefault();
    
    const cropId = document.getElementById('cropId').value;
    const cropName = document.getElementById('cropName').value;
    const typicalNPK = {
        N: parseFloat(document.getElementById('cropN').value) || null,
        P: parseFloat(document.getElementById('cropP').value) || null,
        K: parseFloat(document.getElementById('cropK').value) || null
    };
    const notes = document.getElementById('cropNotes').value;
    
    // Collect recommended fertilizers
    const recommendedFertilizers = [];
    const fertilizerItems = document.querySelectorAll('.fertilizer-item');
    fertilizerItems.forEach(item => {
        const select = item.querySelector('.fertilizer-select');
        const low = item.querySelector('.dosage-low').value;
        const medium = item.querySelector('.dosage-medium').value;
        const high = item.querySelector('.dosage-high').value;
        
        if (select && select.value) {
            recommendedFertilizers.push({
                fertilizerId: select.value,
                dosageRules: {
                    low: parseFloat(low) || null,
                    medium: parseFloat(medium) || null,
                    high: parseFloat(high) || null
                }
            });
        }
    });

    try {
        const response = await fetch(`${API_BASE}/admin/crops`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                cropId: cropId || undefined, 
                cropName, 
                typicalNPK, 
                recommendedFertilizers: recommendedFertilizers.length > 0 ? recommendedFertilizers : undefined,
                notes 
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('adminDashboard', 'Crop saved successfully', 'success');
            cancelCropForm();
            loadAdminData();
        } else {
            const errorMsg = data.error || data.message || 'Failed to save crop';
            showAlert('adminDashboard', errorMsg, 'error');
            console.error('Crop save error:', data);
        }
    } catch (error) {
        console.error('Request error:', error);
        showAlert('adminDashboard', 'Failed to save crop: ' + error.message, 'error');
    }
}

async function handleFertilizerSave(e) {
    e.preventDefault();
    
    const fertilizerId = document.getElementById('fertilizerId').value;
    const name = document.getElementById('fertilizerName').value;
    const nutrientComposition = {
        N: parseFloat(document.getElementById('fertN').value) || 0,
        P: parseFloat(document.getElementById('fertP').value) || 0,
        K: parseFloat(document.getElementById('fertK').value) || 0
    };
    const type = document.getElementById('fertilizerType').value;
    const instructions = document.getElementById('fertilizerInstructions').value;

    try {
        // Note: This endpoint needs to be added to admin routes
        const response = await fetch(`${API_BASE}/admin/fertilizers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ fertilizerId, name, nutrientComposition, type, instructions })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('adminDashboard', 'Fertilizer saved successfully', 'success');
            document.getElementById('fertilizerForm').reset();
            loadAdminData();
        } else {
            const errorMsg = data.error || data.message || 'Failed to save fertilizer';
            showAlert('adminDashboard', errorMsg, 'error');
            console.error('Fertilizer save error:', data);
        }
    } catch (error) {
        console.error('Request error:', error);
        showAlert('adminDashboard', 'Failed to save fertilizer: ' + error.message, 'error');
    }
}

async function handleRuleSave(e) {
    e.preventDefault();
    
    const ruleId = document.getElementById('ruleId').value;
    const cropId = document.getElementById('ruleCropId').value;
    
    const condition = {
        soilPhRange: {
            min: parseFloat(document.getElementById('phMin').value) || null,
            max: parseFloat(document.getElementById('phMax').value) || null
        },
        NPK: {
            N: document.getElementById('ruleN').value || null,
            P: document.getElementById('ruleP').value || null,
            K: document.getElementById('ruleK').value || null
        },
        growthStage: document.getElementById('ruleGrowthStage').value || null
    };

    let recommendations;
    try {
        recommendations = JSON.parse(document.getElementById('ruleRecommendations').value);
    } catch (error) {
        showAlert('adminDashboard', 'Invalid JSON format for recommendations', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/rules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ ruleId, cropId, condition, recommendations })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('adminDashboard', 'Rule saved successfully', 'success');
            document.getElementById('ruleForm').reset();
            loadAdminData();
        } else {
            const errorMsg = data.error || data.message || 'Failed to save rule';
            showAlert('adminDashboard', errorMsg, 'error');
            console.error('Rule save error:', data);
        }
    } catch (error) {
        console.error('Request error:', error);
        showAlert('adminDashboard', 'Failed to save rule: ' + error.message, 'error');
    }
}

// Load feedback data
async function loadFeedbackData() {
    if (!currentUser) return;
    
    const feedbackList = document.getElementById('feedbackList');
    const select = document.getElementById('feedbackRecSelect');
    
    // Show loading state
    if (feedbackList) {
        feedbackList.innerHTML = '<div class="loading">Loading feedback history...</div>';
    }
    
    try {
        // Load recommendations for feedback dropdown
        const recommendationsResponse = await fetch(`${API_BASE}/recommendations/user/${currentUser.userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (recommendationsResponse.ok) {
            const recommendations = await recommendationsResponse.json();
            
            if (select) {
                select.innerHTML = '<option value="">Select a recommendation...</option>';
                recommendations.forEach(rec => {
                    const option = document.createElement('option');
                    option.value = rec.recId;
                    option.textContent = `${rec.cropId} - ${new Date(rec.createdAt).toLocaleDateString()}`;
                    select.appendChild(option);
                });
            }
        }

        // Load user's feedback history
        const feedbacksResponse = await fetch(`${API_BASE}/recommendations/user/${currentUser.userId}/feedbacks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (feedbacksResponse.ok) {
            const contentType = feedbacksResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const feedbacks = await feedbacksResponse.json();
                displayUserFeedbacks(feedbacks);
            } else {
                throw new Error('Server returned non-JSON response');
            }
        } else {
            let errorData = {};
            try {
                const text = await feedbacksResponse.text();
                try {
                    errorData = JSON.parse(text);
                } catch (e) {
                    errorData = { message: text || `HTTP ${feedbacksResponse.status}` };
                }
            } catch (e) {
                errorData = { message: `HTTP ${feedbacksResponse.status}: ${feedbacksResponse.statusText}` };
            }
            if (feedbackList) {
                feedbackList.innerHTML = `<div class="alert alert-error">Failed to load feedback history: ${errorData.message || 'Unknown error'}</div>`;
            }
        }
    } catch (error) {
        console.error('Error loading feedback data:', error);
        if (feedbackList) {
            feedbackList.innerHTML = `<div class="alert alert-error">Error loading feedback data: ${error.message}</div>`;
        }
    }
}

// Display user's feedback history
function displayUserFeedbacks(feedbacks) {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) {
        console.error('feedbackList element not found');
        return;
    }
    
    if (!feedbacks || !Array.isArray(feedbacks)) {
        feedbackList.innerHTML = '<div class="alert alert-info">No feedback history available.</div>';
        return;
    }
    
    if (feedbacks.length === 0) {
        feedbackList.innerHTML = '<div class="alert alert-info">You haven\'t submitted any feedback yet. Submit feedback using the form on the left.</div>';
        return;
    }
    
    let html = '';
    feedbacks.forEach(feedback => {
        const rating = feedback.rating || 0;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const rec = feedback.recommendation || {};
        const date = feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : 'N/A';
        
        html += '<div class="user-feedback-item">';
        html += '<div class="feedback-item-header">';
        html += `<div class="feedback-rating-display">${stars} <strong>(${rating}/5)</strong></div>`;
        html += `<div class="feedback-date-display">${date}</div>`;
        html += '</div>';
        
        if (rec && rec.cropId) {
            html += '<div class="feedback-rec-link">';
            html += `<p><strong>For:</strong> ${rec.cropId} | ${rec.growthStage || 'N/A'} stage</p>`;
            html += `<p><strong>Date:</strong> ${rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'N/A'}</p>`;
            html += '</div>';
        }
        
        if (feedback.comments && feedback.comments.trim()) {
            html += '<div class="feedback-comments-display">';
            html += `<p><strong>Your Comments:</strong></p>`;
            html += `<p>${feedback.comments}</p>`;
            html += '</div>';
        } else {
            html += '<div class="feedback-comments-display">';
            html += `<p class="text-muted">No comments provided</p>`;
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    feedbackList.innerHTML = html;
}

// Handle feedback submit
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const recId = document.getElementById('feedbackRecSelect').value;
    const rating = parseInt(document.getElementById('feedbackRating').value);
    const comments = document.getElementById('feedbackComments').value;

    if (!recId) {
        showAlert('feedbackPage', 'Please select a recommendation', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/recommendations/${recId}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ rating, comments })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('feedbackPage', 'Feedback submitted successfully!', 'success');
            document.getElementById('feedbackForm').reset();
            // Reload feedback data to show the new feedback
            setTimeout(() => {
                loadFeedbackData();
            }, 500);
        } else {
            const errorMsg = data.error || data.message || 'Failed to submit feedback';
            showAlert('feedbackPage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Feedback error:', error);
        showAlert('feedbackPage', 'Failed to submit feedback: ' + error.message, 'error');
    }
}

// Utility functions
function showAlert(pageId, message, type) {
    let page = document.getElementById(pageId);
    
    // Special handling for register/login pages with alerts container
    if (pageId === 'registerPage') {
        const alertsContainer = document.getElementById('registerAlerts');
        if (alertsContainer) {
            alertsContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            alertsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => {
                if (alertsContainer) {
                    alertsContainer.innerHTML = '';
                }
            }, 5000);
            return;
        }
    }
    
    if (pageId === 'loginPage') {
        const alertsContainer = document.getElementById('loginAlerts');
        if (alertsContainer) {
            alertsContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            alertsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => {
                if (alertsContainer) {
                    alertsContainer.innerHTML = '';
                }
            }, 5000);
            return;
        }
    }
    
    // If page not found, try to find it by class or fallback
    if (!page) {
        // Try finding by class name
        const pages = document.querySelectorAll('.page');
        for (let p of pages) {
            if (p.id && p.id.includes(pageId.replace('Page', ''))) {
                page = p;
                break;
            }
        }
    }
    
    if (!page) {
        // Fallback to any visible page
        const visiblePage = document.querySelector('.page[style*="block"]');
        if (visiblePage) {
            page = visiblePage;
        } else {
            // Last resort - find any page
            page = document.querySelector('.page');
        }
    }
    
    if (!page) {
        console.error('Could not find page to show alert:', pageId);
        alert(message); // Fallback to browser alert
        return;
    }
    
    // Remove existing alerts of the same type
    const existingAlerts = page.querySelectorAll('.alert');
    existingAlerts.forEach(alert => {
        if (alert.textContent.includes(message.substring(0, 20))) {
            alert.remove();
        }
    });
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.marginBottom = '15px';
    
    // Insert at the beginning of the page content
    const firstChild = page.firstElementChild || page.firstChild;
    if (firstChild) {
        page.insertBefore(alert, firstChild);
    } else {
        page.appendChild(alert);
    }
    
    // Scroll to top to see the alert
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

