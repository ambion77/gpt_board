import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ 로그인 API (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // MySQL에서 사용자 조회
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.promise().query(query, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "이메일이 존재하지 않습니다." });
    }

    const user = results[0];

    const hashedPassword = await bcrypt.hash(password, 10); // 10은 salt rounds
    const hashededPassword = await bcrypt.hash(user.password, 10); // 10은 salt rounds

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });

    console.log('token:' + token + '__');

    res.json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("로그인 중 오류 발생:", err);
    res.status(500).json({ message: "서버 오류", error: err });
  }
});

export default router;