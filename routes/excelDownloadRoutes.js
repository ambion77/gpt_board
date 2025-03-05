import express from 'express';
import db from '../db.js'; // MySQL 연결 파일

const router = express.Router();

// 파일 목록 조회 API
router.get('/files', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, title, file_name, created_date FROM excel_file ORDER BY created_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('파일 목록 조회 실패:', error);
        res.status(500).json({ error: '파일 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 파일 다운로드 API
router.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT file_name, file_data FROM excel_file WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        }

        const { file_name, file_data } = rows[0];
        res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(file_data);
    } catch (error) {
        console.error('파일 다운로드 실패:', error);
        res.status(500).json({ error: '파일 다운로드 중 오류가 발생했습니다.' });
    }
});

export default router;