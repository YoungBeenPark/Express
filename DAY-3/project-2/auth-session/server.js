const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret_keys",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

// 정적 서빙
app.use(express.static(path.join(__dirname, "views")));

// 로그인
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// 로그인 처리
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 간단한 인증 로직(실제로는 데이터베이스 조회 필요함)
  if (username === "youngbeen" && password === "qwe123") {
    req.session.user = { username, role: "admin" };
    res.redirect("/dashboard");
  } else {
    res.status(401).send("인증실패");
  }
});

// 대시보드 라우트 수정
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
  } else {
    res.redirect("/login");
  }
});

// 사용자 API 수정
app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ message: "로그인하세요!" });
  }
});

// 로그아웃
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("로그아웃하는 중 오류 발생!!!");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

const PORT = 2004;
app.listen(PORT, () => {
  console.log(`서버 ${PORT}가 실행중입니다~`);
});
