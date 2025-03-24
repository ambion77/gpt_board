import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import winston from "winston";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import redisRoutes from "./routes/redisRoutes.js";
import gptRoutes from "./routes/gptRoutes.js";
import xmlRoutes from "./routes/xmlRoutes.js";
import crawlingRoutes from "./routes/crawlingRoutes.js";
import crawlingScheduleRoutes, { scheduleCrawling } from './routes/crawlingScheduleRoutes.js';
import crawlingNewsRoutes from './routes/crawlingNewsRoutes.js';
import excelUploadRoutes from './routes/excelUploadRoutes.js';
import excelDownloadRoutes from './routes/excelDownloadRoutes.js';
import excelRoutes from './routes/excelRoutes.js';
import googleTrendsRoutes from './routes/googleTrendsRoutes.js';
import watchLog from './watchLog.js';

if (process.env.NODE_ENV === 'prd') {
    dotenv.config({ path: '.env.prd' });
}else if (process.env.NODE_ENV === 'dev') {
    dotenv.config({ path: '.env.dev' });    
} else {
    dotenv.config({ path: '.env.loc' });
}

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

const app = express();
const PORT = 3000;

scheduleCrawling(); //크롤링 스케줄러

app.use(express.json());
//app.use(cors());  
app.use(cors({
    origin: process.env.VITE_FRONT_URL,
    credentials: true,
    exposedHeaders: ['Content-Disposition'] //파일다운로드시 파일명을 전달하려면 Content-Disposition설정이 필요함
  }))
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

app.use("/api/users", userRoutes);  // 사용자 CRUD API 추가
app.use("/api/auth", authRoutes); // 로그인 API 추가
app.use("/api/menu", menuRoutes); // menu API 추가
app.use("/api/image", imageRoutes); // 이미지 API 추가
app.use("/api/board", boardRoutes); // 게시판 API 추가
app.use("/api/redis", redisRoutes); // radis API 추가
app.use("/api/gpt", gptRoutes); // gpt API 추가
app.use("/api/xml", xmlRoutes); // xml파일게시판 API 추가
app.use("/api/crawling", crawlingRoutes); // 크롤링 API 추가
app.use("/api/crawlingScheduleRoutes", crawlingScheduleRoutes); // 크롤링스케쥴 API 추가
app.use("/api/crawlingNews", crawlingNewsRoutes); // 크롤링뉴스 API 추가
app.use("/api/googleTrends", googleTrendsRoutes); // 구글트렌드 API 추가

app.use('/api/excelUpload', excelUploadRoutes);
app.use('/api/excelDownload', excelDownloadRoutes);
app.use('/api/excel', excelRoutes);


app.listen(PORT, () => {
    logger.info(`🚀 서버 실행 중: ${process.env.VITE_API_URL}`);
});
