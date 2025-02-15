import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();
let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

//메뉴 데이터 불러오기(/api/menu/menuTree)
router.get("/menuTree", async (req, res) => {
  try {
    const [results] = await db.query(queries.getMenuTree); // ✅ 올바른 위치
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});

export default router;