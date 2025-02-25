import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import cors from "cors";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
//import "dotenv/config";
import jwt from "jsonwebtoken";
import winston from "winston";

if (process.env.NODE_ENV === 'prd') {
    dotenv.config({ path: ".env.prd" });
  } else {
    dotenv.config({ path: ".env.dev" });
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

//dotenv.config(); // .env 파일 로드
// NODE_ENV에 따라 다른 .env 파일을 로드


const app = express();
const PORT = 3000;

app.use(express.json());
//app.use(cors());  //파일다운로드시 파일명을 전달하려면 Content-Disposition설정이 필요함
app.use(cors({
    origin: process.env.VITE_FRONT_URL,
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  }))
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

app.use("/api/users", userRoutes);  // 사용자 CRUD API 추가
app.use("/api/auth", authRoutes); // 로그인 API 추가
app.use("/api/menu", menuRoutes); // menu API 추가
app.use("/api/image", imageRoutes); // 이미지 API 추가
app.use("/api/board", boardRoutes); // 게시판 API 추가

const xmlFilePath = "board.xml";    // 📌 XML 파일 경로
const POSTS_PER_PAGE = 10;  // 📌 한 페이지당 게시글 수

//xml 파일에서 데이터 읽기
function readXML() {
    if (!fs.existsSync(xmlFilePath)) {
        return { board: { post: [] } };// XML 파일이 없으면 기본 구조 반환
    }
    const xmlData = fs.readFileSync(xmlFilePath, "utf-8");
    
    // 📌 파일이 비어 있으면 기본값 반환
    if (!xmlData) {
        return { board: { post: [] } };
    }

    try {
        const parsedData = new XMLParser().parse(xmlData);

        if (!parsedData.board) {
            return { board: { post: [] } };
        }

        if (!Array.isArray(parsedData.board.post)) {
            parsedData.board.post = parsedData.board.post ? [parsedData.board.post] : [];
        }

        return parsedData;
    } catch (error) {
        console.error("❌ XML 파싱 오류:", error);
        return { board: { post: [] } }; // 오류 발생 시 기본값 반환
    }
}

//xml 파일에 데이터 쓰기
function writeXML(data) {
    const xmlContent = new XMLBuilder({ format: true }).build(data);
    fs.writeFileSync(xmlFilePath, xmlContent, "utf-8");
}

// 📌 게시글 목록 반환 (페이징 지원)
app.get("/posts", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const data = readXML();

    // 게시글을 맵으로 저장 (ID 기준)
    const postMap = {};
    data.board.post.forEach(post => {
        postMap[post.id] = post;
    });

    // 답글을 원글 아래에 계층적으로 추가하는 함수
    function addRepliesToList(post, list) {
        if (!post) return; // 🚨 유효하지 않은 게시글이면 종료
        list.push(post); // 원글 또는 답글 추가

        const replies = data.board.post
            .filter(reply => reply.parentId && reply.parentId == post.id) // 🚨 parentId가 있어야 함
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // 답글은 오래된 순 정렬

        replies.forEach(reply => {
            if (reply.id !== reply.parentId) { // 🚨 자기 자신을 부모로 갖는 경우 방지
                addRepliesToList(reply, list); // 재귀적으로 답글 추가
            }
        });
    }

    // 최종 정리된 리스트
    const structuredPosts = [];
    data.board.post
        .filter(post => post.depth === 0) // 원글만 먼저 필터링
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // 최신순 정렬
        .forEach(originalPost => addRepliesToList(originalPost, structuredPosts)); // 답글 포함 정리

    // 페이징 처리
    const startIdx = (page - 1) * POSTS_PER_PAGE;
    const endIdx = startIdx + POSTS_PER_PAGE;
    const totalPosts = structuredPosts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginatedPosts = structuredPosts.slice(startIdx, endIdx);

    res.json({
        posts: paginatedPosts,
        currentPage: page,
        totalPages: totalPages
    });
});

// 📌 개별 게시글 조회 (ID 기반)
app.get("/post/:id", (req, res) => {
    const postId = req.params.id;
    let data = readXML();

    // post가 배열인지 확인 후 변환
    let posts = Array.isArray(data.board.post) ? data.board.post : [data.board.post];

    // 게시글 찾기
    let postIndex = posts.findIndex(post => post.id == postId);
    if (postIndex === -1) {
        return res.status(404).json({ message: "❌ 해당 게시글을 찾을 수 없습니다." });
    }

    // 조회수 증가
    posts[postIndex].views = (parseInt(posts[postIndex].views) || 0) + 1;
    writeXML(data);

    res.json(posts[postIndex]);
});

// ✅ 게시글 추가 (인증 필요)
app.post("/createPosts", verifyToken, (req, res) => {
    const { title, content } = req.body;
    const author = req.user.userid; // JWT에서 사용자 이메일 가져오기
    let data = readXML();

    const newId = data.board.post.length > 0
        ? Math.max(...data.board.post.map(post => parseInt(post.id))) + 1
        : 1;

    const offset = new Date().getTimezoneOffset() * 60000;
    const today = new Date(Date.now() - offset);
    const formattedDate = today.toISOString().replace("T", " ").split(".")[0];

    const newPost = {
        id: newId.toString(),
        title,
        author,
        content,
        date: formattedDate,
        depth: 0,
        views: 0
    };

    data.board.post.push(newPost);
    writeXML(data);
    res.json({ message: "✅ 게시글 등록 완료!" });
});

// 📌 목록에서 체크된 게시글 삭제
app.post("/deletePosts", verifyToken,(req, res) => {
    const { ids } = req.body; // 선택된 ID 배열
    let data = readXML();

    console.log("📌 삭제 요청된 ID 목록:", ids);
    
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "⚠️ 삭제할 게시글을 선택하세요." });
    }

    // 기존 게시글 필터링 (ID가 선택된 목록에 없는 것만 남기기)
    const originalLength = data.board.post.length;
    data.board.post = data.board.post.filter(post => !ids.includes(Number(post.id)));

    // 삭제된 개수 확인
    const deletedCount = originalLength - data.board.post.length;

    // 변경된 데이터 저장
    writeXML(data);

    if (deletedCount > 0) {
        res.json({ message: `🗑️ ${deletedCount}개의 게시글이 삭제되었습니다!` });
    } else {
        res.status(404).json({ message: "⚠️ 삭제할 게시글을 찾을 수 없습니다." });
    }
});

// ✅ 게시글 삭제 (인증 필요)
app.delete("/deletePost/:id", verifyToken, (req, res) => {
    const postId = req.params.id;
    let data = readXML();

    const postIndex = data.board.post.findIndex(post => post.id == postId);
    if (postIndex === -1) {
        return res.status(404).json({ message: "❌ 해당 게시글을 찾을 수 없습니다." });
    }

    const post = data.board.post[postIndex];

    // ✅ 게시글 작성자와 로그인한 사용자가 일치하는지 확인
    if (post.author !== req.user.userid) {
        return res.status(403).json({ message: "❌ 게시글을 삭제할 권한이 없습니다." });
    }

    data.board.post.splice(postIndex, 1);
    writeXML(data);
    res.json({ message: "🗑 게시글 삭제 완료!" });
});

// 📌 게시글 수정
app.post("/updatePosts", verifyToken, (req, res) => {
    const { id, parentId, title, author, content, date, depth, views} = req.body;
    
    let data = readXML();

    let postIndex = data.board.post.findIndex(post => post.id == id);
    if (postIndex === -1) {
        return res.status(404).json({ message: "❌ 해당 게시글을 찾을 수 없습니다." });
    }

    const post = data.board.post[postIndex];
    // ✅ 게시글 작성자와 로그인한 사용자가 일치하는지 확인
    if (post.author !== req.user.userid) {
        return res.status(403).json({ message: "❌ 게시글을 수정할 권한이 없습니다." });
    }
    if(depth == 0){
        data.board.post[postIndex] = { id, title, author, content, date, depth, views };
    }else{
        data.board.post[postIndex] = { id, parentId ,title, author, content, date, depth, views };
    }     
    writeXML(data);
    res.json({ message: "✅ 게시글 수정 완료!" });
});


// 📌 답글 추가 
app.post("/addReply", verifyToken, (req, res) => {
    const data = readXML();
    const { postId,  content, views } = req.body;

    const parentPost = data.board.post.find(p => p.id === postId);
    if (!parentPost) {
        return res.status(404).json({ message: "❌ 부모 게시글을 찾을 수 없습니다." });
    }

    // 📌 현재 시간을 ISO 8601 형식으로 변환
    const offset = new Date().getTimezoneOffset() * 60000;
    const today = new Date(Date.now() - offset);
    const formattedDate = today.toISOString().replace("T", " ").split(".")[0]; // YYYY-MM-DDTHH:mm:ss 형식

    const newReply = {
        id: (data.board.post.length + 1).toString(),
        parentId: postId,
        depth: parseInt(parentPost.depth) + 1,
        title: '  Re:'+ `${parentPost.title}`,
        author: req.user.userid,
        content: content,
        date: formattedDate,
        views: 0 // 📌 조회수 기본값 추가
    };

    data.board.post.push(newReply);
    writeXML(data);
    res.json({ message: "✅ 답글이 성공적으로 추가되었습니다!" });
});

// ✅ JWT 검증 미들웨어
function verifyToken(req, res, next) {
    const token = req.header("Authorization");
    console.log('server.js verifyToken::'+token);

    if (!token) {
        return res.status(403).json({ message: "접근이 거부되었습니다. 로그인해주세요." });
    }

    jwt.verify(token.replace("Bearer ", ""), "SECRET_KEY", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
        }
        req.user = decoded; // 디코딩된 사용자 정보 저장
        console.log('server.js req.user.id:::'+req.user.id);
        console.log('server.js req.user.email:::'+req.user.email);
        next();
    });
}

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: ${process.env.VITE_API_URL}`);
});
