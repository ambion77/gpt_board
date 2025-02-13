import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ 로그인 API (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { userid, password } = req.body;

  try {
    // MySQL에서 사용자 조회
    const query = "SELECT * FROM users WHERE userid = ?";
    const [results] = await db.promise().query(query, [userid]);

    if (results.length === 0) {
      return res.status(401).json({ message: "사용자아이디가 존재하지 않습니다." });
    }

    const user = results[0];

    const loginPassword = await bcrypt.hash(password, 10); // 10은 salt rounds
    const dbPassword = await bcrypt.hash(user.password, 10); // 10은 salt rounds

    //password bcrypt test
    console.log('login password '+password +' 값은 '+ loginPassword +' 입니다.');
    console.log('db password '+user.password +' 값은 '+ dbPassword +' 입니다.');

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    console.log('user:' + user.id + ' ' + user.email + ' ' + user.password);
    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id, userid: user.userid, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });

    console.log('token:' + token );

    // ✅ 응답 헤더에 JWT 추가
    res.setHeader("Authorization", `Bearer ${token}`);

    //localStorage.setItem('jwt', token);

    res.json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("로그인 중 오류 발생:", err);
    res.status(500).json({ message: "서버 오류", error: err });
  }
});


export default router;