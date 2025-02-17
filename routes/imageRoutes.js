import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();
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

export default router;