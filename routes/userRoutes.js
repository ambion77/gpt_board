import express from "express";
import db from "../db.js"; // MySQL 연결 파일
import bcrypt from "bcrypt";
import loadQueries from "../queryLoader.js";

const router = express.Router();

let queries = {};

// XML에서 쿼리 로드
(async () => {
  queries = await loadQueries();
})();

// ✅ 모든 사용자 조회 (GET /api/users)
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(queries.getAllUsers); // ✅ 올바른 위치
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});

// ✅ 특정 사용자 조회 (GET /api/users/:userid)
router.get("/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;
    const [results] = await db.query(queries.getUserById, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없음" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 실패", error: err });
  }
});

// ✅ 사용자 추가 (POST /api/users)
router.post("/", async (req, res) => {
  try {
    const { userid, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(queries.addUser, [userid, username, email, hashedPassword]);
    res.status(201).json({ id: result.insertId, userid, username, email });
  } catch (err) {
    res.status(500).json({ message: "사용자 추가 실패", error: err });
  }
});

// ✅ 사용자 정보 수정 (PUT /api/users/:userid)
router.put("/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;
    const { username, email } = req.body;

    await db.query(queries.updateUser, [username, email, userId]);
    res.json({ message: "사용자 정보 업데이트 성공" });
  } catch (err) {
    res.status(500).json({ message: "사용자 업데이트 실패", error: err });
  }
});

// ✅ 사용자 삭제 (DELETE /api/users/:id)
router.delete("/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;
    await db.query(queries.deleteUser, [userId]);

    res.json({ message: "사용자 삭제 성공" });
  } catch (err) {
    res.status(500).json({ message: "사용자 삭제 실패", error: err });
  }
});

export default router;
