const API_URL = 'https://script.google.com/macros/s/AKfycbx6_ROHGXnTko2lXNSG1-heeiY1E-Gl_Uvv2uu6z49jqPEpUNnqvf75y-djPem3y1y1/exec';
let articles = [];

// Tab navigation
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'manage') loadArticlesList();
}

// Notifications
function showNotification(message, error = false) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.style.backgroundColor = error ? '#ff4d4f' : '#52c41a';
    notif.style.display = 'block';
    setTimeout(() => notif.style.display = 'none', 3000);
}

// Fetch articles
async function fetchArticles() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        console.log('Fetched articles:', data);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Fetch error:', err);
        showNotification('Failed to fetch articles', true);
        return [];
    }
}

// Add article
async function addArticle() {
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

    console.log('Adding article:', article);

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        });
        const result = await res.json();
        console.log('Add response:', result);
        
        if (result.status === 'success') {
            showNotification('Article added successfully!');
            document.getElementById('articleForm').reset();
            loadDashboard();
            loadArticlesList();
        } else {
            showNotification('Failed to add article: ' + (result.message || 'Unknown error'), true);
        }
    } catch (err) {
        console.error('Add error:', err);
        showNotification('Error adding article: ' + err.message, true);
    }
}

// Delete article
async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    console.log('Deleting article with ID:', id);
    
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        const result = await res.json();
        console.log('Delete response:', result);
        
        if (result.status === 'success') {
            showNotification('Article deleted successfully!');
            loadDashboard();
            loadArticlesList();
        } else {
            showNotification('Failed to delete article: ' + (result.message || 'Unknown error'), true);
        }
    } catch (err) {
        console.error('Delete error:', err);
        showNotification('Error deleting article: ' + err.message, true);
    }
}

// Load dashboard
async function loadDashboard() {
    articles = await fetchArticles();
    document.getElementById('dashboardCounts').innerHTML = `
        <p>Total Articles: ${articles.length}</p>
        <p>Trending Articles: ${articles.filter(a => a.trending === 'yes').length}</p>
    `;
    const recent = articles.slice(-5).reverse();
    document.getElementById('recentArticles').innerHTML = recent.map(a => `
        <div class="article-card">
            <h3>${a.title}</h3>
            <p>${a.excerpt}</p>
        </div>
    `).join('');
}

// Load articles for management
async function loadArticlesList() {
    articles = await fetchArticles();
    document.getElementById('articlesList').innerHTML = articles.map(a => `
        <div class="article-card">
            <h3>${a.title}</h3>
            <p>${a.excerpt}</p>
            <button onclick="deleteArticle(${a.id})">Delete</button>
        </div>
    `).join('');
}

// Initial load
showTab('dashboard');