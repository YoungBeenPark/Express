// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const path = require("path");

const User = require("./models/User");

const app = express();

// 데이터베이스 연결
mongoose
  .connect(process.env.MONGO_URI,)
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // MongoDB Node.js 드라이버 버전 4 이상 위 옵션들이 기본적으로
    // 활성화 되있다고 오류가 떠서 주석처리 해줬음
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 오류:", err));

// 미들웨어 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS 사용 시 true로 설정
  })
);

app.use(csrf({ cookie: true }));
app.use(express.static(path.join(__dirname, "public")));

// 글로벌 변수 설정
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user;
  next();
});

// 라우트 정의

// 홈 페이지 (로그인 상태에 따라 대시보드로 리다이렉트)
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

// 회원가입 페이지
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// 회원가입 처리
app.post("/signup", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // 유효성 검사
  if (!username || !email || !password || !confirmPassword) {
    return res.render("signup", { error: "모든 필드를 입력해주세요!" });
  }

  if (password !== confirmPassword) {
    return res.render("signup", { error: "비밀번호가 일치하지 않아요😭" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render("signup", { error: "이미 사용하고있는 이용자가 있습니다!🤨" });
    }

    const user = new User({ username, email, password });
    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("signup", { error: "회원가입 중 오류가 발생했습니다!😢" });
  }
});

// 로그인 페이지
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// 로그인
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 유효성 검사
  if (!email || !password) {
    return res.render("login", { error: "모든 필드를 입력해주세요!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", {
        error: "이메일 or 비밀번호가 일치하지 않습니다!",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", {
        error: "이메일 or 비밀번호가 일치하지 않습니다!",
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "로그인 중 오류가 발생했습니다." });
  }
});

// 대시보드 (로그인 필요)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.session.user });
});

// 로그아웃
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// 서버 시작
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
