import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

// __filename과 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// XML 데이터 파일저장
router.post('/upload', bodyParser.json(), (req, res) => {
    const { xml } = req.body;
    console.log('Received XML:', xml);

     // 1. XML 데이터를 파일로 저장
     const filePath = path.join(__dirname, '../upload', 'uploadedData.xml');
     fs.writeFile(filePath, xml, (err) => {
         if (err) {
             console.error('XML 데이터 저장 실패:', err);
             return res.status(500).json({ error: 'XML 데이터 저장 중 오류가 발생했습니다.' });
         }
         console.log('XML 데이터가 성공적으로 저장되었습니다.');
         res.status(200).json({ message: 'XML 데이터가 성공적으로 저장되었습니다.' });
     });
});

export default router; 