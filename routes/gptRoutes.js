import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";


const router = express.Router();
router.use(cors());
router.use(express.json());

dotenv.config({ path: ".env.dev" });

router.post("/summarize", async (req, res) => {
  const { text } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `다음 내용을 요약해줘:\n\n${text}` }],
      temperature: 0.5,
    }),
  });

  const data = await response.json();
  console.log('data::::::::;'+data);
  //res.json({ summary: data });
  res.json({ summary: data.choices[0].message.content });
});

export default router;
