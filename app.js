const API_URL = "https://script.google.com/macros/s/AKfycbx6_ROHGXnTko2lXNSG1-heeiY1E-Gl_Uvv2uu6z49jqPEpUNnqvf75y-djPem3y1y1/exec";

// Fetch all articles
async function fetchArticles() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        renderArticles(data);
    } catch (err) {
        console.error("Error fetching articles:", err);
    }
}

// Save a new article
async function saveArticle(article) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'saveArticle', article })
        });
        const result = await res.json();
        if (result.status === "success") {
            fetchArticles(); // Refresh list
            console.log("Article saved!");
        } else {
            console.error("Save failed:", result.message);
        }
    } catch (err) {
        console.error("Error saving article:", err);
    }
}

// Delete an article by ID
async function deleteArticle(id) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteArticle', id })
        });
        const result = await res.json();
        if (result.status === "success") {
            fetchArticles(); // Refresh list
            console.log("Article deleted!");
        } else {
            console.error("Delete failed:", result.message);
        }
    } catch (err) {
        console.error("Error deleting article:", err);
    }
}

// Render articles to the page
function renderArticles(articles) {
    const container = document.getElementById("articlesContainer");
    container.innerHTML = "";
    articles.forEach(article => {
        const div = document.createElement("div");
        div.classList.add("article-card");
        div.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <p><strong>Author:</strong> ${article.author}</p>
            <p><strong>Category:</strong> ${article.category}</p>
            <button onclick="deleteArticle('${article.id}')">Delete</button>
        `;
        container.appendChild(div);
    });
}

// Example usage
document.getElementById("saveBtn").addEventListener("click", () => {
    const article = {
        id: Date.now().toString(),
        title: document.getElementById("title").value,
        excerpt: document.getElementById("excerpt").value,
        author: document.getElementById("author").value,
        category: document.getElementById("category").value,
        date: new Date().toLocaleDateString(),
        image: document.getElementById("image").value || "",
        tags: document.getElementById("tags").value || "",
        content: document.getElementById("content").value || "",
        trending: false
    };
    saveArticle(article);
});

// Load articles on page load
window.addEventListener("DOMContentLoaded", fetchArticles);
