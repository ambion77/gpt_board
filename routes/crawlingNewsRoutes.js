import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();
let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

router.get('/news', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // 기본값은 1
  const limit = parseInt(req.query.limit) || 10; // 기본값은 10
  const offset = (page - 1) * limit; // 오프셋 계산

  try {
      const [news] = await db.query(queries.getNewsListWithPagination, [limit, offset]);
      const [totalRows] = await db.query(queries.getNewsListWithPaginationCount); // 총 뉴스 개수 조회
      const totalCount = totalRows[0].count; // 총 개수
      console.log('totalCount:', totalCount);

      res.json({
          news,
          pagination: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
          }
      });
  } catch (error) {
      console.error('뉴스 데이터 조회 실패:', error);
      res.status(500).json({ error: '뉴스 데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 크롤링 수동 실행 API
router.post('/crawling', async (req, res) => {
  try {
      await crawling();
      res.json({ message: '크롤링이 성공적으로 완료되었습니다.' });
  } catch (error) {
      console.error('크롤링 실행 실패:', error);
      res.status(500).json({ error: '크롤링 실행 중 오류가 발생했습니다.' });
  }
});

export default router;