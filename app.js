const API_URL = "https://script.google.com/macros/s/AKfycbx6_ROHGXnTko2lXNSG1-heeiY1E-Gl_Uvv2uu6z49jqPEpUNnqvf75y-djPem3y1y1/exec";

// Handle form submit
document.getElementById("articleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const article = {
    title: document.getElementById("title").value.trim(),
    excerpt: document.getElementById("excerpt").value.trim(),
    author: document.getElementById("author").value.trim(),
    category: document.getElementById("category").value.trim(),
    image: document.getElementById("image").value.trim(),
    tags: document.getElementById("tags").value.trim(),
    content: document.getElementById("content").value.trim(),
    date: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(article),
    });

    const result = await response.json();
    alert(result.message || "Article saved!");
    document.getElementById("articleForm").reset();
    loadArticles();
  } catch (error) {
    console.error("Save Error:", error);
    alert("Failed to save article.");
  }
});

// Fetch and render articles
async function loadArticles() {
  try {
    const response = await fetch(API_URL);
    const articles = await response.json();

    const container = document.getElementById("articlesContainer");
    container.innerHTML = "";

    if (!articles || articles.length === 0) {
      container.innerHTML = "<p>No articles found.</p>";
      return;
    }

    articles.forEach((article, index) => {
      const div = document.createElement("div");
      div.className = "article-card";
      div.innerHTML = `
        <h3>${article.title}</h3>
        <p><strong>Author:</strong> ${article.author}</p>
        <p><strong>Category:</strong> ${article.category}</p>
        <p>${article.excerpt}</p>
        <button onclick="deleteArticle(${index})">Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Load Error:", error);
    document.getElementById("articlesContainer").innerHTML = "<p>Failed to load articles.</p>";
  }
}

// Delete article
async function deleteArticle(index) {
  if (!confirm("Are you sure you want to delete this article?")) return;

  try {
    const response = await fetch(API_URL + "?delete=" + index, { method: "POST" });
    const result = await response.json();
    alert(result.message || "Article deleted!");
    loadArticles();
  } catch (error) {
    console.error("Delete Error:", error);
    alert("Failed to delete article.");
  }
}

// Load on startup
window.onload = loadArticles;
