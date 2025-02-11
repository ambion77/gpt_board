import express from "express";
import "dotenv/config";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json()); // JSON 요청을 처리하기 위해 필요
app.use(cors()); // CORS 미들웨어 추가

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // 로그인 API 추가

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
