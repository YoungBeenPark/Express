const express = require("express");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const postsFilePath = path.join(__dirname, "../data/posts.json");

function getPosts() {
  if (!fs.existsSync(postsFilePath)) {
    fs.writeFileSync(postsFilePath, JSON.stringify([]));
  }

  const postData = fs.readFileSync(postsFilePath);

  return JSON.parse(postData);
}

function savePosts(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
}

router.get("/", (req, res) => {
  const posts = getPosts();

  res.render("index", { posts, user: req.session.user || null });
});

router.get("/new", authMiddleware, (req, res) => {
  res.render("newPost", { user: req.session.user || null });
});

router.post("/new", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  const posts = getPosts();

  const newPost = {
    id: Date.now(),
    title,
    content,
    author: req.session.user,
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);

  savePosts(posts);

  res.redirect("/posts");
});

router.get("/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).send("게시글을 찾을 수가 없습니다.");
  }

  res.render("post", { post, user: req.session.user });
});

router.get("/:id/edit", authMiddleware, (req, res) => {
  const postId = parseInt(req.params.id);
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).send("게시글을 찾을 수가 없습니다.");
  }

  if (post.author !== req.session.user) {
    return res.status(403).send("수정 권한이 없습니다.");
  }

  res.render("editPost", { post, user: req.session.user || null });
});

router.post("/:id/edit", authMiddleware, (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, content } = req.body;
  const posts = getPosts();

  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).send("게시글을 찾을 수 없습니다.");
  }

  if (posts[postIndex].author !== req.session.user) {
    return res.status(403).send("수정 권한이 없습니다.");
  }

  posts[postIndex].title = title;
  posts[postIndex].content = content;

  savePosts(posts);

  res.redirect(`/posts/${postId}`);
});

router.post("/:id/delete", authMiddleware, (req, res) => {
  const postId = parseInt(req.params.id);

  let posts = getPosts();

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).send("게시글을 찾을 수 없습니다.");
  }

  if (post.author !== req.session.user) {
    return res.status(403).send("삭제 권한이 없습니다.");
  }

  posts = posts.filter((p) => p.id !== postId);

  savePosts(posts);

  res.redirect("/posts");
});

module.exports = router;