import express from "express";
import multer from "multer";
import sharp from "sharp";  // metadata를 위한 이미지 처리 모듈
import fs from "fs";  // 파일 시스템 모듈
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // 업로드 폴더 설정

let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

//이미지 목록 데이터 불러오기(/api/menu/getImageList)
router.get("/getImageList", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  // 페이지 번호 (기본값: 1)
    const limit = 10;  // 한 페이지에 표시할 이미지 수
    const offset = (page - 1) * limit;

    // 이미지 목록 조회 쿼리
    const [images] = await db.query(queries.getImageListWithPagination, [limit, offset]);

    // 전체 이미지 수 조회
    const [countResult] = await db.query(queries.getImageListWithPaginationCount);
    const totalCount = countResult[0].totalCount;
    
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit);

    // 이전 페이지와 다음 페이지 계산
    const previousPage = page > 1 ? page - 1 : null;  // 첫 페이지에서는 이전 페이지가 없음
    const nextPage = page < totalPages ? page + 1 : null;  // 마지막 페이지에서는 다음 페이지가 없음

    // 클라이언트로 전달할 데이터
    res.json({
      images,
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


//이미지 정보 데이터 불러오기(/api/menu/getImageInfo)
router.get("/getImageInfo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [results] = await db.query(queries.getImageInfo, [id]); // ✅ 올바른 위치
    console.log('getImageInfo:', results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});

// 이미지 업로드 API
router.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
    }

    // 파일을 Base64로 변환
    const filePath = req.file.path;
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

    // DB 저장
    const { originalname } = req.file;
    const metadata = await sharp(req.file.path).metadata(); //이미지 메타데이터 가져오기 (너비, 높이) 
    const file_width = metadata.width;
    const file_height = metadata.height;    
    const file_size = req.file.size; // 파일 크기
    console.log('req.file:', req.file);
    console.log('mimetype:', req.file.mimetype);

    await db.query(queries.insertImage, [originalname,originalname, base64Image, file_width, file_height,file_size]);

    // 임시 파일 삭제
    fs.unlinkSync(filePath);

    res.json({ message: "이미지가 성공적으로 업로드되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "이미지 업로드 실패", error: err });
  }
});

// 이미지 삭제 API
router.post("/deleteImages", async (req, res) => {
  try {
    const { imageIds, page = 1, limit = 5 } = req.body;  // page와 limit 값도 받음
    console.log('imageIds:', imageIds);

    if (!imageIds || imageIds.length == 0) {
      return res.status(400).json({ message: "삭제할 이미지가 없습니다." });
    }

    // 숫자 배열로 변환
    const ids = imageIds.map(id => parseInt(id, 10)); 

    // DB에서 여러 개의 id를 삭제
    await db.query(queries.deleteImages, [ids]);

    // 삭제 후 이미지 목록 갱신 (페이징 적용)
    const offset = (page - 1) * limit;

    // 총 이미지 수 조회 (페이징을 위한 총 개수)
    const [totalResults] = await db.query(queries.getImageListWithPaginationCount);
    const totalImages = totalResults[0].total;

    // 페이지에 맞는 이미지 목록 조회
    const [images] = await db.query(queries.getImageListWithPagination, [limit, offset]);

    res.json({
      message: "선택한 이미지가 삭제되었습니다.",
      images: images,  // 갱신된 이미지 목록
      total: totalImages  // 총 이미지 수
    });

  } catch (err) {
    res.status(500).json({ message: "이미지 삭제 실패", error: err });
  }
});


export default router;