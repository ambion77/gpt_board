import express from 'express';
import db from '../db.js';
import loadQueries from "../queryLoader.js"; // XML 기반 쿼리 로더

const router = express.Router();

let queries = {};

// 🔹 XML 쿼리 로드 (비동기)
(async () => {
  queries = await loadQueries();
})();

// 업로드된 엑셀 데이터 목록 조회
router.get('/dataList', async (req, res) => {
    try {
        const [rows] = await db.execute(queries.getExcelDataList);
        res.json(rows);
    } catch (error) {
        console.error('엑셀 데이터 목록 조회 실패:', error);
        res.status(500).json({ error: '데이터 조회 중 오류 발생' });
    }
});

// 특정 엑셀 데이터 상세 조회
router.get('/detail', async (req, res) => {
    const { title, file_name } = req.query;
    try {
        const [rows] = await db.execute(queries.getExcelDataDetail, [title, file_name]);
        res.json(rows);
    } catch (error) {
        console.error('엑셀 데이터 상세 조회 실패:', error);
        res.status(500).json({ error: '데이터 조회 중 오류 발생' });
    }
});

/*// 선택한 행 삭제
router.post('/delete', async (req, res) => {
    const { title, fileName, rowIndexes } = req.body;
    try {
        await Promise.all(
            rowIndexes.map(async (rownum) => {
                await db.execute(
                    'DELETE FROM excel_data WHERE title = ? AND file_name = ? AND rownum = ?',
                    [title, fileName, rownum]
                );
            })
        );
        res.json({ message: '삭제 성공' });
    } catch (error) {
        console.error('삭제 실패:', error);
        res.status(500).json({ error: '삭제 중 오류 발생' });
    }
});

// 수정된 셀 업데이트
router.post('/update', async (req, res) => {
    const { title, fileName, editedData } = req.body;
    try {
        await Promise.all(
            Object.keys(editedData).map(async (key) => {
                const [rownum, column] = key.split('_');
                const value = editedData[key];
                await db.execute(
                    `UPDATE excel_data SET ${column} = ? WHERE title = ? AND file_name = ? AND rownum = ?`,
                    [value, title, fileName, rownum]
                );
            })
        );
        res.json({ message: '수정 성공' });
    } catch (error) {
        console.error('수정 실패:', error);
        res.status(500).json({ error: '수정 중 오류 발생' });
    }
});*/

// 선택된 행 삭제
router.post('/delete-rows', async (req, res) => {
    const { ids } = req.body;

    // ids 배열이 비어있지 않은지 확인
    if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(', '); // ? 플레이스홀더 생성
        const query = `DELETE FROM excel_data WHERE id IN (${placeholders})`;
        
        await db.execute(query, ids); // ids 배열을 쿼리에 전달
    }
    
    res.sendStatus(200);
});

// 수정된 셀 업데이트
router.post('/update-rows', async (req, res) => {
    const updates = req.body;
    for (const rowId in updates) {
        const modifiedData = updates[rowId];
        // 쿼리 문자열을 동적으로 생성
        const query = 'UPDATE excel_data SET ' + Object.keys(modifiedData).map(key => `${key} = ?`).join(', ') + ' WHERE id = ?';
        const values = [...Object.values(modifiedData), rowId]; // 수정된 값과 ID를 배열로 만듭니다.
        
        await db.execute(query, values);
    }
    res.sendStatus(200);
});

export default router;