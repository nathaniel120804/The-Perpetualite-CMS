const API_URL = 'https://script.google.com/macros/s/AKfycbx6_ROHGXnTko2lXNSG1-heeiY1E-Gl_Uvv2uu6z49jqPEpUNnqvf75y-djPem3y1y1/exec';
let articles = [];
let authChecked = false;

// Tab navigation
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'manage') loadArticlesList();
    
    document.querySelectorAll('#authLink, #manageAuthLink, #addAuthLink').forEach(link => {
        link.href = API_URL;
        link.target = '_blank';
    });
}

// Notifications
function showNotification(message, error = false) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.style.backgroundColor = error ? '#ef4444' : '#22c55e';
    notif.style.display = 'block';
    setTimeout(() => notif.style.display = 'none', 4000);
}

// Enhanced fetch with error handling
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (response.url.includes('/ServiceLogin') || response.status === 302) {
            throw new Error('Authentication required');
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Test API connection
async function testAPI() {
    try {
        const response = await safeFetch(API_URL);
        const data = await response.json();
        return true;
    } catch (error) {
        if (error.message.includes('Authentication required')) showAuthPrompts(true);
        return false;
    }
}

// Show/hide authentication prompts
function showAuthPrompts(show) {
    document.getElementById('authPrompt').style.display = show ? 'block' : 'none';
    document.getElementById('manageAuthPrompt').style.display = show ? 'block' : 'none';
    document.getElementById('addAuthPrompt').style.display = show ? 'block' : 'none';
    authChecked = true;
}

// Fetch articles
async function fetchArticles() {
    try {
        const res = await safeFetch(API_URL);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        if (err.message.includes('Authentication required') && !authChecked) showAuthPrompts(true);
        showNotification('Failed to fetch articles', true);
        return [];
    }
}

// Add article
async function addArticle(event) {
    if (event) event.preventDefault();
    const apiWorking = await testAPI();
    if (!apiWorking) {
        showNotification('Please authorize the app to add articles', true);
        return;
    }

    const article = {
        id: Date.now(),
        title: document.getElementById('articleTitle').value,
        excerpt: document.getElementById('articleExcerpt').value,
        author: document.getElementById('articleAuthor').value,
        category: document.getElementById('articleCategory').value,
        date: document.getElementById('articleDate').value || new Date().toISOString().split('T')[0],
        image: document.getElementById('articleImage').value,
        tags: document.getElementById('articleTags').value,
        content: document.getElementById('articleContent').value,
        trending: document.getElementById('articleTrending').checked ? 'yes' : 'no'
    };

    try {
        const res = await safeFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        });
        const result = await res.json();
        if (result.status === 'success') {
            showNotification('Article added successfully!');
            document.getElementById('articleForm').reset();
            loadDashboard();
            loadArticlesList();
            showTab('dashboard');
        } else {
            showNotification('Failed to add article: ' + (result.message || 'Unknown error'), true);
        }
    } catch (err) {
        if (err.message.includes('Authentication required')) {
            showNotification('Please authorize the app: Open the URL in a new tab', true);
            showAuthPrompts(true);
        } else {
            showNotification('Error adding article: ' + err.message, true);
        }
    }
}

// Delete article
async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const apiWorking = await testAPI();
    if (!apiWorking) {
        showNotification('Please authorize the app to delete articles', true);
        return;
    }
    try {
        const res = await safeFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        const result = await res.json();
        if (result.status === 'success') {
            showNotification('Article deleted successfully!');
            loadDashboard();
            loadArticlesList();
        } else {
            showNotification('Failed to delete article: ' + (result.message || 'Unknown error'), true);
        }
    } catch (err) {
        if (err.message.includes('Authentication required')) {
            showNotification('Please authorize the app: Open the URL in a new tab', true);
            showAuthPrompts(true);
        } else {
            showNotification('Error deleting article: ' + err.message, true);
        }
    }
}

// Load dashboard
async function loadDashboard() {
    articles = await fetchArticles();
    document.getElementById('totalArticles').textContent = articles.length;
    document.getElementById('trendingArticles').textContent = articles.filter(a => a.trending === 'yes').length;
    const recent = articles.slice(-5).reverse();
    document.getElementById('recentCount').textContent = recent.length;
    document.getElementById('recentArticles').innerHTML = recent.map(a => `
        <div class="article-card">
            <div class="article-image" style="background-image: url('${a.image || 'https://via.placeholder.com/300x160?text=No+Image'}')"></div>
            <div class="article-content">
                <h3>${a.title}</h3>
                <div class="article-meta">
                    <span>By ${a.author}</span>
                    <span>${a.date}</span>
                </div>
                <p>${a.excerpt}</p>
                ${a.trending === 'yes' ? '<span style="color: #f59e0b;">⭐ Trending</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Load articles for management
async function loadArticlesList() {
    articles = await fetchArticles();
    document.getElementById('articlesList').innerHTML = articles.map(a => `
        <div class="article-card">
            <div class="article-image" style="background-image: url('${a.image || 'https://via.placeholder.com/300x160?text=No+Image'}')"></div>
            <div class="article-content">
                <h3>${a.title}</h3>
                <div class="article-meta">
                    <span>By ${a.author}</span>
                    <span>${a.date}</span>
                </div>
                <p>${a.excerpt}</p>
                <div class="article-actions">
                    <button class="btn btn-danger" onclick="deleteArticle(${a.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('articleForm');
    if (form) form.addEventListener('submit', addArticle);
    document.getElementById('articleDate').valueAsDate = new Date();
    document.querySelectorAll('#authLink, #manageAuthLink, #addAuthLink').forEach(link => {
        link.href = API_URL;
        link.target = '_blank';
    });
    showTab('dashboard');
    testAPI();
});
