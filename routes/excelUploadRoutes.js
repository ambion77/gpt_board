import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import db from "../db.js"; // MySQL 연결 파일
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

// __filename과 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

// XML 데이터 파일저장
router.post('/upload', bodyParser.json(), (req, res) => {
    const { xml, title,fileName } = req.body;
    console.log('Received XML:', xml);

     // 1. XML 데이터를 파일로 저장
     const filePath = path.join(__dirname, '../upload', fileName);
     fs.writeFile(filePath, xml, (err) => {
         if (err) {
             console.error('XML 데이터 저장 실패:', err);
             return res.status(500).json({ error: 'XML 데이터 저장 중 오류가 발생했습니다.' });
         }
         console.log(title+'XML 데이터가 성공적으로 저장되었습니다.');
         res.status(200).json({ message: 'XML 데이터가 성공적으로 저장되었습니다.' });
     });
});

// XML 데이터 수신 및 저장
router.post('/save', bodyParser.json(), async (req, res) => {
    const { xml, title, fileName } = req.body;
    console.log('Received XML:', xml);

    // XML 데이터를 데이터베이스에 저장
    try {
        const { headers, rows } = await parseXmlToRows(xml);

        // 기존 main_id 값 중 최대값을 가져오기
        const [maxMainIdResult] = await db.query('SELECT MAX(main_id) AS maxMainId FROM excel_data');
        const newMainId = (maxMainIdResult[0].maxMainId || 0) + 1; // 기존 최대값에 1을 더함
        
        // 1.컬럼명 저장
        await db.query(
            'INSERT INTO excel_data (main_id, title,file_name, rownum, column1, column2, column3, column4, column5, column6, column7, column8, column9, column10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newMainId, title, fileName, 0, ...headers, null, null, null, null, null, null, null, null].slice(0, 14)
        );

        // 2.데이터 행 저장
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            await db.query(
                'INSERT INTO excel_data (main_id, title, file_name, rownum, column1, column2, column3, column4, column5, column6, column7, column8, column9, column10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newMainId, title, fileName, i + 1, ...row, null, null, null, null, null, null, null, null].slice(0, 14)
            );
        }
        console.log('데이터베이스에 데이터가 성공적으로 저장되었습니다.');
        res.status(200).json({ message: 'XML 데이터가 성공적으로 저장되었습니다.' });
    } catch (dbError) {
        console.error('데이터베이스 저장 실패:', dbError);
        res.status(500).json({ error: '데이터베이스 저장 중 오류가 발생했습니다.' });
    }
});

// XML 데이터를 행으로 파싱하는 함수
async function parseXmlToRows(xml) {
    const parser = new xml2js.Parser();
    return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, result) => {
            if (err) {
                console.error('XML 파싱 실패:', err);
                return reject(err);
            }

            const headers = [];
            const rows = [];
            if (result.root && result.root.row) {
                result.root.row.forEach((row, index) => {
                    if (index === 0) {
                        // 첫 번째 행은 컬럼명
                        Object.keys(row).forEach((key) => {
                            headers.push(row[key][0]);
                        });
                    } else {
                        // 나머지 행은 데이터
                        const rowData = [];
                        Object.keys(row).forEach((key) => {
                            rowData.push(row[key][0] || null);
                        });
                        rows.push(rowData);
                    }
                });
            } else {
                console.error('XML 구조가 예상과 다릅니다:', result);
            }
            resolve({ headers, rows });
        });
    });
}

// 파일 업로드 및 BLOB 저장
router.post('/blob', bodyParser.json(), async (req, res) => {
    const {title, fileName, fileData } = req.body; // fileData는 base64 인코딩된 파일 데이터
    console.log('Received file:', fileName);

    // base64 데이터를 버퍼로 변환
    const buffer = Buffer.from(fileData, 'base64');

    // 데이터베이스에 파일 저장
    try {
        await db.execute(
            'INSERT INTO excel_file (title, file_name, file_data) VALUES (?, ?, ?)',
            [title, fileName, buffer]
        );
        console.log('BLOB 파일이 데이터베이스에 성공적으로 저장되었습니다.');
        res.status(200).json({ message: 'BLOB 파일이 성공적으로 저장되었습니다.' });
    } catch (dbError) {
        console.error('데이터베이스 저장 실패:', dbError);
        res.status(500).json({ error: '데이터베이스 저장 중 오류가 발생했습니다.' });
    }
});


export default router; 