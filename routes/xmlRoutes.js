import express from "express";
import fs from "fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { verifyToken } from './token.js'; // ✅ ES 모듈 방식 임포트

const router = express.Router();

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
router.get("/posts", (req, res) => {
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
router.get("/post/:id", (req, res) => {
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
router.post("/createPosts", verifyToken, (req, res) => {
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
router.post("/deletePosts", verifyToken,(req, res) => {
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
router.delete("/deletePost/:id", verifyToken, (req, res) => {
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
router.post("/updatePosts", verifyToken, (req, res) => {
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
router.post("/addReply", verifyToken, (req, res) => {
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

export default router;