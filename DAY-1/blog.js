const express = require("express");
const bodyParser = require("body-parser");

const blog = express();
const PORT = 1004;

// 미들웨어 설정
blog.use(bodyParser.json());

blog.get("/", (req, res) => {
  res.send("Welcome 저의 블로그에 오신걸 환영합니다.");
});

blog.listen(PORT, () => {
  console.log(`서버 http://localhost:${PORT}로 실행중입니다!!!!!`);
});

let notes = [];

// 게시글 목록 보기
blog.get("/notes", (req, res) => {
  res.json(notes);
});

// 게시글 작성
blog.post("/notes", (req, res) => {
  const { 제목, 내용 } = req.body;
  const newNote = { id: notes.length + 1, 제목, 내용 };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// 게시글 상세보기
blog.get("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const note = notes.find((p) => p.id === noteId);
  if (!note) {
    return res.status(404).json({ message: "게시글을 찾을 수 없음!!!" });
  }
  res.json(note);
});

// 게시글 수정
blog.put("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const { 제목, 내용 } = req.body;
  const noteIndex = notes.findIndex((p) => p.id === noteId);
  if (noteIndex === -1) {
    return res.status(404).json({ message: "게시글을 찾을 수 없음!!!" });
  }
  notes[noteIndex] = { id: noteId, 제목, 내용 };
  res.json(notes[noteIndex]);
});

// 게시글 삭제
blog.delete("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  notes = notes.filter((p) => p.id !== noteId);
  res.status(204).send();
});
