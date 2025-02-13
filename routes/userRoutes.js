import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";

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

// ✅ 특정 사용자 조회 (GET /api/users/:userid)
router.get("/:userid", (req, res) => {
  const userId = req.params.userid;
  db.query("SELECT * FROM users WHERE userid = ?", [userId], (err, results) => {
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
  const { userid, username, email, password } = req.body;

  // 1. 비밀번호 해싱
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ 
        message: "비밀번호 암호화 실패",
        error: err 
      });
    }
  
    // 2. 해시된 비밀번호로 사용자 생성 
    db.query(
      "INSERT INTO users (userid,username, email, password) VALUES (?, ?, ?, ?)",
      [userid, username, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "사용자 추가 실패", error: err });
        }
        res.status(201).json({ id: result.insertId, userid, username, email });
      }
    );
  });
});

// ✅ 사용자 정보 수정 (PUT /api/users/:userid)
router.put("/:userid", (req, res) => {
  const userId = req.params.userid;
  const { userid, username, email } = req.body;
  db.query(
    "UPDATE users SET username = ?, email = ? WHERE userid = ?",
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
router.delete("/:userid", (req, res) => {
  const userId = req.params.userid;
  db.query("DELETE FROM users WHERE userid = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "사용자 삭제 실패", error: err });
    }
    res.json({ message: "사용자 삭제 성공" });
  });
});

export default router;
