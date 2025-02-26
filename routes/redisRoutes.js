import express from "express";
import cors from "cors";
import { createClient } from "redis"; // ✅ 4.x+ 버전 임포트
import dotenv from "dotenv";

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

logger.info("🚀 Server is running!");

// Redis 클라이언트 생성
const redisClient = createClient({
  url: `redis://${process.env.VITE_REDIS_USERNAME}:${process.env.VITE_REDIS_PASSWORD}@${process.env.VITE_REDIS_HOST}:${process.env.VITE_REDIS_PORT}/0`
});

// 연결 이벤트 핸들링
redisClient.on('connect', () => logger.info('✅ Redis Connected'))
          .on('error', err => logger.error('❌ Redis Error:', err));

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

export default router;