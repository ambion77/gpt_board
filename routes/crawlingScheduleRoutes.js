import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

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
                crawled_at: new Date()
            });
        });

        // 모든 뉴스 데이터를 순회하면서 데이터베이스에 저장
        for (const item of news) {
            try {
                console.log(`News title saved: "${item.title}"`);
                console.log(`News link saved: "${item.link}"`);
                console.log(`News pub_date saved: "${item.pub_date}"`);
                console.log(`News crawled_at saved: "${item.crawled_at}"`);
                await db.execute(queries.insertNews, [
                    item.title,
                    item.link,
                    item.pub_date,
                    item.crawled_at
                ]);
            } catch (err) {
                console.error('Error saving news:', err);
                continue;
            }
        }

        console.log(`=== Successfully saved ${quotes.length} quotes to database ===`);
    } catch (error) {
        console.error('Crawling job failed:', error);
    }
}

// 매일 자정에 실행되는 스케줄러
const scheduleCrawling = () => {
    console.log('=== Crawling scheduler initialized ===');
    // 매일 자정(00:00)에 실행
    // 매시각(매시 00분)에 실행
    cron.schedule('0 * * * *', crawlQuotes);
};

export default scheduleCrawling;