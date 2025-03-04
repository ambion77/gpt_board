import express from 'express';
import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();
let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

// 크롤링 함수
async function crawlQuotes() {
    try {
        console.log('=== Starting daily news crawling job ===');
        const { data } = await axios.get("https://www.yna.co.kr/rss/news.xml");
        const $ = cheerio.load(data, { xmlMode: true });
        const news = [];

        // RSS 피드에서 뉴스 아이템 파싱
        $('item').slice(0, 10).each((_, el) => {
            const $el = $(el);
            news.push({
                title: $el.find('title').text().replace(/\<\!\[CDATA\[(.*?)\]\]\>/g, '$1').trim(),
                link: $el.find('link').text().trim(),
                pub_date: new Date($el.find('pubDate').text()),
                crawled_date: new Date()
            });
        });

        // 모든 뉴스 데이터를 순회하면서 데이터베이스에 저장
        for (const item of news) {
            try {
                console.log(`News title saved: "${item.title}"`);
                console.log(`News link saved: "${item.link}"`);
                console.log(`News pub_date saved: "${item.pub_date}"`);
                console.log(`News crawled_date saved: "${item.crawled_date}"`);
                await db.execute(queries.insertNews, [
                    item.title,
                    item.link,
                    item.pub_date,
                    item.crawled_date
                ]);
            } catch (err) {
                console.error('Error saving news:', err);
                continue;
            }
        }

        console.log(`=== Successfully saved quotes to database ===`);
        return news;
    } catch (error) {
        console.error('Crawling job failed:', error);
        throw error;
    }
}

// 매일 자정에 실행되는 스케줄러
const scheduleCrawling = () => {
    console.log('=== Crawling scheduler initialized ===');
    // 매일 자정(0 0 * * *)에 실행
    // 매시각(0 * * * *)에 실행
    cron.schedule('0 14 * * *', crawlQuotes);
};

// 크롤링 수동 실행 API
router.get("/crawling", async (req, res) => {
    try {
        const news = await crawlQuotes(); // crawlQuotes를 호출
        res.json({ 
            message: '크롤링이 성공적으로 완료되었습니다.',
            newsCount: news.length
        });
    } catch (error) {
        console.error('크롤링 실행 실패:', error);
        res.status(500).json({ error: '크롤링 실행 중 오류가 발생했습니다.' });
    }
});

export default router;  // default export 추가. server.js에서 crawlingScheduleRoutes 이름으로 import 가능
export { scheduleCrawling };    // server.js에서 scheduleCrawling 함수를 내보내기