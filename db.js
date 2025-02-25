import mysql from "mysql2/promise";
import dotenv from "dotenv";

//dotenv.config(); // .env 파일 로드

// NODE_ENV에 따라 다른 .env 파일을 로드
if (process.env.NODE_ENV === 'prd') {
  dotenv.config({ path: ".env.prd" });
} else {
  dotenv.config({ path: ".env.dev" });
}

const pool = mysql.createPool({
  host: process.env.DB_HOST, // MySQL 서버 주소
  user: process.env.DB_USER, // MySQL 사용자 이름
  password: process.env.DB_PASS, // MySQL 비밀번호
  database: process.env.DB_NAME, // 사용할 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL 연결 실패:", err);
    return;
  }
  console.log("✅ MySQL 연결 성공!");
  connection.release();
});

export default pool; // ✅ ES 모듈 방식으로 변경
