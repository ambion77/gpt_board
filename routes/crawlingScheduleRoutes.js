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
        console.log('=== Starting daily crawling job ===');
        const { data } = await axios.get("http://quotes.toscrape.com/");
        const $ = cheerio.load(data);
        const quotes = [];

        $(".quote").each((_, el) => {
            quotes.push({
                text: $(el).find(".text").text(),
                author: $(el).find(".author").text(),
                crawled_at: new Date()
            });
        });

        console.log('quotes:'+quotes[0].text);
        console.log('quotes:'+quotes[0].author);
        console.log('quotes:'+quotes[0].crawled_at);

        // 모든 quotes 데이터를 순회하면서 데이터베이스에 저장
        for (const quote of quotes) {
            try {
                await db.execute(queries.insertCrawling, [quote.text.replace(/['"“”]/g, ''), quote.author, quote.crawled_at]);
                console.log(`Quote saved: "${quote.text.substring(0, 30)}..."`);
            } catch (err) {
                console.error('Error saving quote:', err);
                continue; // 한 건이 실패해도 다음 건 계속 진행
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
    cron.schedule('49 16 * * *', crawlQuotes);
};

export default scheduleCrawling;