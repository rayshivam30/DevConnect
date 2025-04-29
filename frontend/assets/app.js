// frontend/app.js

console.log("App Loaded");

const postsContainer = document.getElementById("postsContainer");
const newPostForm = document.getElementById("newPostForm");
const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");

let posts = [];

// Fetch posts from backend
async function fetchPosts() {
    try {
        const response = await fetch("http://127.0.0.1:8000/posts");
        posts = await response.json();
        displayPosts();
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}


// Show the form for creating a new post
function showNewPostForm() {
    newPostForm.style.display = "block";
}

// Hide the form after post is created
function hideNewPostForm() {
    newPostForm.style.display = "none";
    postTitle.value = "";
    postContent.value = "";
}

// Submit new post to backend
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPost = {
        title: postTitle.value,
        content: postContent.value
    };

    try {
        if (editingPostId) {
            const response = await fetch(`http://127.0.0.1:8000/posts/${editingPostId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPost)
            });
            const updatedPost = await response.json();
            posts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
        } else {
            const response = await fetch("http://127.0.0.1:8000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPost)
            });
            const createdPost = await response.json();
            posts.push(createdPost);
        }

        displayPosts();
        hideNewPostForm();
        editingPostId = null;
    } catch (error) {
        console.error("Error submitting post:", error);
    }
});

// Call fetchPosts when page loads
fetchPosts();

// Call showNewPostForm when the button is clicked
document.getElementById("createPostBtn").addEventListener("click", showNewPostForm);

function viewPost(id) {
    window.location.href = `post.html?id=${id}`;
}

function displayPosts() {
    postsContainer.innerHTML = "";
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        postDiv.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <button onclick="viewPost(${post.id})">View</button>
            <button onclick="editPost(${post.id})">Edit</button>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;

        postsContainer.appendChild(postDiv);
    });
}

async function deletePost(id) {
    if (confirm("Are you sure you want to delete this post?")) {
        try {
            await fetch(`http://127.0.0.1:8000/posts/${id}`, {
                method: "DELETE"
            });
            posts = posts.filter(post => post.id !== id);
            displayPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
}

let editingPostId = null;

function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editingPostId = id;
    postTitle.value = post.title;
    postContent.value = post.content;
    showNewPostForm();
}
