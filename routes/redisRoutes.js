import express from "express";
import cors from "cors";
import { createClient } from "redis"; // ✅ 4.x+ 버전 임포트
import dotenv from "dotenv";
import winston from "winston";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(cors());
dotenv.config({ path: ".env.dev" });

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

// Redis 클라이언트 생성
const redisClient = createClient({
  url: `redis://${process.env.VITE_REDIS_USERNAME}:${process.env.VITE_REDIS_PASSWORD}@${process.env.VITE_REDIS_HOST}:${process.env.VITE_REDIS_PORT}/0`
});

// 연결 이벤트 핸들링
redisClient.on('connect', () => {
  logger.info('✅ Redis Connected');
});

// Redis 클라이언트 오류 처리
redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

// 명시적 연결
await redisClient.connect();

const VISITOR_KEY = "visitor_count";

router.get("/visitors", async (req, res) => {
  try {
    // 연결 상태 확인
    if (!redisClient.isOpen) {
      throw new Error("Redis connection closed");
    }

    // 키 존재 여부 확인
    const exists = await redisClient.exists(VISITOR_KEY);
    
    if (!exists) {
      await redisClient.set(VISITOR_KEY, 0); // 초기값 0 설정
    }

    // 값 증가 및 반환
    const count = await redisClient.incr(VISITOR_KEY);
    res.json(`${count}명 방문중`);

  } catch (err) {
    logger.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 방문자 수 증가
router.post("/userVisitors", async (req, res) => {
  try {

      if (!redisClient.isOpen) {
        return res.status(500).json({ error: "Redis connection closed" });
      }

      // 요청 헤더에서 JWT 토큰 가져오기
      const token = req.headers.authorization?.split(" ")[1]; // "Bearer {token}" 형식일 경우
      if (!token) {
          return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      // JWT 검증 및 payload 추출
      let payload;
      try {
          payload = jwt.verify(token, process.env.VITE_JWT_SECRET); // JWT 시크릿 키 필요
      } catch (err) {
          return res.status(401).json({ error: "Invalid Token" });
      }

      const userId = payload.userid;
      if (!userId) {
          return res.status(400).json({ error: "Invalid User Data" });
      }

      // 오늘 날짜를 YYYYMMDD 형식으로 저장
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const userVisitKey = `user:${userId}:visits:${today}`;

      // 방문 횟수 증가
      const visitCount = await redisClient.incr(userVisitKey);

      // 만료 시간 설정 (하루 후 자동 삭제)
      await redisClient.expire(userVisitKey, 86400); // 24시간 = 86400초

      res.json({
          message: `User ${userId} visited ${visitCount} times today`,
          visitCount
      });

  } catch (err) {
      logger.error("❌ Error:", err);
      res.status(500).json({ error: err.message });
  }
});

export default router;