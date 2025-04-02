import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더
import winston from "winston";  // 📌 Winston 로깅 추가
import { sendTelegramMessage }  from '../telegramBot.js'; // 텔레그램 봇 모듈 import

// 인증번호 저장 객체 (메모리에 저장, 실제 서비스에서는 Redis 등 사용 권장)
const verificationCodes = {};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

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
    logger.error("로그인 중 오류 발생:", err);
    console.error("로그인 중 오류 발생:", err);
    res.status(500).json({ message: "서버 오류", error: err });
  }
});

// 인증번호 발송 API
router.post("/sendVerificationCode", async (req, res) => {
  const { telegramId } = req.body;

  try {
    // 6자리 랜덤 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 인증번호 저장 (텔레그램 ID와 인증번호를 매핑)
    verificationCodes[telegramId] = verificationCode;

    // 텔레그램 메시지 전송
    await sendTelegramMessage(telegramId, `인증번호: ${verificationCode}`);

    res.status(200).json({ message: "인증번호가 발송되었습니다." });
  } catch (error) {
    console.error("인증번호 발송 오류:", error);
    res.status(500).json({ message: "인증번호 발송 중 오류가 발생했습니다." });
  }
});

// 인증번호 검증 API
router.post("/verifyCode", async (req, res) => {
  const { verificationCode, telegramId } = req.body;

  try {
    // 저장된 인증번호와 입력된 인증번호 비교
    if (verificationCodes[telegramId] === verificationCode) {
      // 인증 성공 시 JWT 토큰 발급
      const token = jwt.sign({ telegramId }, process.env.VITE_JWT_SECRET, {
        expiresIn: "1h",
      });

      // 인증번호 삭제 (보안을 위해)
      delete verificationCodes[telegramId];

      res.status(200).json({ message: "인증 성공", token });
    } else {
      res.status(401).json({ message: "인증번호가 일치하지 않습니다." });
    }
  } catch (error) {
    console.error("인증번호 검증 오류:", error);
    res.status(500).json({ message: "인증번호 검증 중 오류가 발생했습니다." });
  }
});

export default router;