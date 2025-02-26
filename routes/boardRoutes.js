import express from "express";
import multer from "multer";
import fs from "fs";  // 파일 시스템 모듈
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더
import path from "path";
import winston from "winston";

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
const upload = multer({ dest: "uploads/" }); // 업로드 폴더 설정

let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

//게시물 목록 데이터 불러오기(/api/menu/getBoardList)
router.get("/getBoardList", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  // 페이지 번호 (기본값: 1)
    const limit = 10;  // 한 페이지에 표시할 게시물 수
    const offset = (page - 1) * limit;

    // 게시물 목록 조회 쿼리
    const [boards] = await db.query(queries.getBoardListWithPagination, [limit, offset]);

    // 전체 게시물 수 조회
    const [countResult] = await db.query(queries.getBoardListWithPaginationCount);
    const totalCount = countResult[0].totalCount;
    
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit);

    // 이전 페이지와 다음 페이지 계산
    const previousPage = page > 1 ? page - 1 : null;  // 첫 페이지에서는 이전 페이지가 없음
    const nextPage = page < totalPages ? page + 1 : null;  // 마지막 페이지에서는 다음 페이지가 없음

    // 클라이언트로 전달할 데이터
    res.json({
      boards,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        previousPage,
        nextPage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});


//게시물 정보 데이터 불러오기(/api/menu/getBoardInfo)
router.get("/getBoardInfo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [results] = await db.query(queries.getBoardInfo, [id]); // ✅ 올바른 위치
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});

// 게시물 생성 API
router.post('/create', upload.single('file'), async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // 1. 게시물 기본 정보 저장
      const [boardResult] = await connection.execute(queries.insertBoard, [req.body.title, req.body.content, '작성자']);
  
      // 2. 파일 정보 저장
      if (req.file) {
        console.log('req.file:', req.file);
        const fileInfo = {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          filename: req.file.filename,
          content:req.file.content,
          path: req.file.path,
          size: req.file.size
        };
  
        await connection.execute(queries.insertBoardFile,
          [
            boardResult.insertId,
            fileInfo.originalname,
            fileInfo.mimetype,
            fileInfo.path,
            fileInfo.size
          ]
        );
      }
  
      await connection.commit();
      res.status(201).json({ 
        success: true, 
        message: '게시물 생성 성공' 
      });
  
    } catch (error) {
      await connection.rollback();
      console.error('게시물 생성 오류:', error);
      
      // 업로드된 파일 삭제
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
  
      res.status(500).json({ 
        success: false, 
        message: '서버 오류 발생' 
      });
    } finally {
      connection.release();
    }
});

// 게시물 삭제 API
router.post("/deleteBoards", async (req, res) => {
  try {
    const { boardIds, page = 1, limit = 5 } = req.body;  // page와 limit 값도 받음
    console.log('boardIds:', boardIds);

    if (!boardIds || boardIds.length == 0) {
      return res.status(400).json({ message: "삭제할 게시물가 없습니다." });
    }

    // 숫자 배열로 변환
    const ids = boardIds.map(id => parseInt(id, 10)); 

    // DB에서 여러 개의 id를 삭제
    await db.query(queries.deleteBoards, [ids]);
    // DB에서 여러 개의 file id를 삭제
    await db.query(queries.deleteBoardsFile, [ids]);

    // 삭제 후 게시물 목록 갱신 (페이징 적용)
    const offset = (page - 1) * limit;

    // 총 게시물 수 조회 (페이징을 위한 총 개수)
    const [totalResults] = await db.query(queries.getBoardListWithPaginationCount);
    const totalBoards = totalResults[0].total;

    // 페이지에 맞는 게시물 목록 조회
    const [boards] = await db.query(queries.getBoardListWithPagination, [limit, offset]);

    res.json({
      message: "선택한 게시물이 삭제되었습니다.",
      boards: boards,  // 갱신된 게시물 목록
      total: totalBoards  // 총 게시물 수
    });

  } catch (err) {
    res.status(500).json({ message: "게시물 삭제 실패", error: err });
  }
});

// 게시물 수정 API
router.post("/updateBoard", async (req, res) => {
  try {
      const { id, title, content } = req.body;
      if (!id || !title || !content) {
          return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
      }

      const [result] = await db.query(queries.updateBoard, [title, content, id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "수정할 게시물을 찾을 수 없습니다." });
      }

      res.json({ success: true, message: "게시물이 수정되었습니다." });
  } catch (error) {
      console.error("게시물 수정 오류:", error);
      res.status(500).json({ message: "서버 오류 발생", error });
  }
});

// 답변 추가 API
router.post("/addReply", async (req, res) => {
  try {
      const { title, content, parent_id } = req.body;
      if (!title || !content || !parent_id) {
          return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
      }

      const [result] = await db.query(queries.insertReply, [title, content, parent_id, "작성자"]);

      if (result.affectedRows === 0) {
          return res.status(500).json({ message: "답변 등록 실패" });
      }

      res.json({ success: true, message: "답변이 등록되었습니다." });
  } catch (error) {
      console.error("답변 등록 오류:", error);
      res.status(500).json({ message: "서버 오류 발생", error });
  }
});


// 파일 다운로드 API
router.get('/download/:fileId', async (req, res) => {
    try {

      console.log('req.params.fileId:', req.params.fileId);
      // 1. DB에서 파일 정보 조회
      const [fileRows] = await db.execute(queries.getBoardInfo, [req.params.fileId]);
  
      if (fileRows.length === 0) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      }
  
      const file = fileRows[0];
      
      // 2. 실제 파일 존재 여부 확인
      const filePath = file.file_path;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '파일이 존재하지 않습니다' });
      }
  
      // 3. 파일 다운로드 설정
      res.setHeader('Content-Type', file.file_type);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.file_name)}"`); // 파일명 설정
  
      // 4. 파일 스트림으로 전송
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
  
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      res.status(500).json({ error: '서버 오류 발생' });
    }
  });

export default router;