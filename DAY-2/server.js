// server.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

// 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 미들웨어
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret-key", // 실제 환경에서는 안전한 비밀키를 사용하세요
    resave: false,
    saveUninitialized: false,
  })
);

app.use(loggerMiddleware);

// 라우팅
app.use("/", authRoutes);
app.use("/posts", postRoutes);

// 홈 페이지 라우트
app.get("/", (req, res) => {
  res.redirect("/posts");
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("서버 내부 오류가 발생했습니다.");
});



// 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});