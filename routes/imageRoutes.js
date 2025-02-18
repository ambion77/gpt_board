import express from "express";
import multer from "multer";
import fs from "fs";
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

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
    const [results] = await db.query(queries.getImageList); // ✅ 올바른 위치
    res.json(results);
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
    await db.query(queries.insertImage, [originalname,originalname, base64Image]);

    // 임시 파일 삭제
    fs.unlinkSync(filePath);

    res.json({ message: "이미지가 성공적으로 업로드되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "이미지 업로드 실패", error: err });
  }
});

export default router;