import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

router.get("/scrape", async (req, res) => {
    try {
        const { data } = await axios.get("http://quotes.toscrape.com/");
        const $ = cheerio.load(data);
        const quotes = [];

        $(".quote").each((_, el) => {
            quotes.push({
                text: $(el).find(".text").text(),
                author: $(el).find(".author").text()
            });
        });

        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  export default router;  