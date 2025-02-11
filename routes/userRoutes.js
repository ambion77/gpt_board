import express from "express";
import db from "../db.js"; // MySQL 연결 파일

const router = express.Router();

// ✅ 모든 사용자 조회 (GET /api/users)
router.get("/", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB 조회 실패", error: err });
    }
    res.json(results);
  });
});

// ✅ 특정 사용자 조회 (GET /api/users/:id)
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB 조회 실패", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없음" });
    }
    res.json(results[0]);
  });
});

// ✅ 사용자 추가 (POST /api/users)
router.post("/", (req, res) => {
  const { username, email, password } = req.body;
  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "사용자 추가 실패", error: err });
      }
      res.status(201).json({ id: result.insertId, username, email });
    }
  );
});

// ✅ 사용자 정보 수정 (PUT /api/users/:id)
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;
  db.query(
    "UPDATE users SET username = ?, email = ? WHERE Aid = ?",
    [username, email, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "사용자 업데이트 실패", error: err });
      }
      res.json({ message: "사용자 정보 업데이트 성공" });
    }
  );
});

// ✅ 사용자 삭제 (DELETE /api/users/:id)
router.delete("/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "사용자 삭제 실패", error: err });
    }
    res.json({ message: "사용자 삭제 성공" });
  });
});

export default router;
