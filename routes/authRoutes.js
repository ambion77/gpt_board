import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();
let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

// ✅ 로그인 API (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { userid, password } = req.body;

  try {
    // ✅ MySQL에서 사용자 조회 (XML에서 로드한 쿼리 사용)
    const [results] = await db.query(queries.getUserById, [userid]);

    if (results.length === 0) {
      return res.status(401).json({ message: "사용자 아이디가 존재하지 않습니다." });
    }

    const user = results[0];

    // ✅ 비밀번호 검증 (bcrypt.compare 사용)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    console.log('user:', user.id, user.email, user.password);

    // ✅ JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, userid: user.userid, email: user.email },
      "SECRET_KEY",
      { expiresIn: "1h" }
    );

    console.log('token:', token);

    // ✅ 응답 헤더에 JWT 추가
    res.setHeader("Authorization", `Bearer ${token}`);

    res.json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("로그인 중 오류 발생:", err);
    res.status(500).json({ message: "서버 오류", error: err });
  }
});

export default router;