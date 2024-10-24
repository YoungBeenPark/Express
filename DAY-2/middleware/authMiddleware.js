module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // 인증된 사용자일 경우 다음 미들웨어로 진행
  } else {
    // 로그인 페이지와 회원가입 페이지에 대한 접근은 허용
    if (req.path === "/login" || req.path === "/signup") {
      return next();
    }
    res.redirect("/login"); // 인증되지 않은 사용자일 경우 로그인 페이지로 리디렉션
  }
};
