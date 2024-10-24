const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const userFilePath = path.join(__dirname, "../data/users.json");

function getUsers() {
  if (!fs.existsSync(userFilePath)) {
    fs.writeFileSync(userFilePath, JSON.stringify([]));
  }

  const userData = fs.readFileSync(userFilePath);

  return JSON.parse(userData);
}

function saveUsers(users) {
  fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
}

router.get("/register", (req, res) => {
  res.render("register", { user: req.session.username || null });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const users = getUsers();

  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    return res.send("이미 존재 하는 사용자입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });

  saveUsers(users);

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login", { user: req.session.user || null });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const users = getUsers();

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.send("사용자를 찾을 수가 없습니다.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.send("비밀번호가 일치하지 않습니다.");
  }

  req.session.user = user.username;

  res.redirect("/posts");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("로그아웃 중 오류가 발생했습니다.");
    }

    res.redirect("/login");
  });
});

module.exports = router;