// frontend/post.js

const postContainer = document.getElementById("postContent");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/posts/${postId}`);
        const post = await response.json();

        postContainer.innerHTML = `
            <h1>${post.title}</h1>
            <p>${post.content}</p>
            <a href="index.html">← Back to All Posts</a>
        `;
    } catch (err) {
        postContainer.innerHTML = `<h2>Post not found 😢</h2>`;
    }
}

loadPost();
