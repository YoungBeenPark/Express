const express = require("express");
const app = express();

app.use(express.static('public'));

const PORT = 2004;
app.listen(PORT, () =>{
  console.log(`서버 ${PORT}으로 실행중입니데이~`)
});
