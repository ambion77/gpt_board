import express from "express";
import axios from "axios";
import puppeteer from "puppeteer";

const router = express.Router();

router.get("/trends", async (req, res) => {
    try {
        //Google Trends는 JavaScript로 렌더링되므로 Puppeteer를 사용하여 데이터를 가져옴
        //Google Trends는 데이터를 초기 HTML에서 제공하지 않고, JavaScript 실행 후 로드하기 때문
        const browser = await puppeteer.launch({
          headless: true, // 백그라운드에서 실행
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    
        const page = await browser.newPage();
        await page.goto("https://trends.google.com/trends/trendingsearches/daily?geo=KR", {
          waitUntil: "networkidle2",
        });
    
        const trends = await page.evaluate(() => {
          return Array.from(document.querySelectorAll(".enOdEe-wZVHld-xMbwt")).map((el) => {
          return {
              title: el.querySelector(".mZ3RIc").innerText,
              //link: el.querySelector("a")?.href || "#",
            };
          });
        });
    
        await browser.close();
        res.json(trends);
      } catch (error) {
        console.error("Error fetching trends:", error);
        res.status(500).json({ error: "Failed to fetch Google Trends data" });
      }
  });

  export default router;  