# A.I. 생성 게시판

1. 실행방법

-vscode콘솔에서 로컬서버 시작

npm run dev

2. 프로젝트 생성방법

npm create vite@latest total

cd total

npm init -y

npm install express mysql2 bcrypt jsonwebtoken dotenv cors fast-xml-parser concurrently


3. DB생성방법

 3-1. mysql 설치

 3-2. DB 생성(MY_DATA)

 3-3. 테이블 생성

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE menu (
  menu_id int NOT NULL AUTO_INCREMENT,
  menu_code varchar(20) NOT NULL,
  menu_name varchar(255) NOT NULL,
  parent_id int DEFAULT NULL,
  depth tinyint unsigned NOT NULL,
  url varchar(255) DEFAULT NULL,
  sort_order smallint unsigned NOT NULL,
  created_date timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (menu_id),
  UNIQUE KEY menu_code (menu_code),
  KEY parent_id (parent_id),
  CONSTRAINT menu_ibfk_1 FOREIGN KEY (parent_id) REFERENCES menu (menu_id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE base64_images (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    image_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    base64_data LONGTEXT NOT NULL,
    width int,
    height int,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    INDEX idx_image_name (image_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

3-4. 데이터 입력

INSERT INTO my_data.users
(id, userid, username, email, password)
VALUES(1,'admin','관리자', 'admin@example.com', '1234');

INSERT INTO my_data.users
(id, userid, username, email, password)
VALUES(2, 'guest','게스트', 'guest@example.com', '5678');


4. 소스생성

A.I.에게 게시판 답변형 게시판 생성요청

  board.html

  board.css

  server.js // 게시판과 사용자 정보 로그인 등 서버사이드 소스


A.I.에게 사용자정보 CRUD 가능한 restful API 서버 생성 요청

  login.html

  db.js

  authRoutes.js

  userRoutes.js


5. postman으로 사용자정보 CRUD확인  

5-1. 입력 

POST 방식 http://localhost:3000/api/users

 body raw json 값에 추가

{
  "userid": "admin",
  "username": "관리자",
  "email": "admin@example.com",
  "password":"5678"
} 

5-2. 수정

PUT방식 http://localhost:3000/api/users/admin

 body raw json 값에 추가

{
  "username": "관리자수정",
  "email": "admin_u@example.com"
}


5-3.삭제

DELETE 방식 http://localhost:3000/api/users/admin

  결과

{
    "message": "사용자 삭제 성공"
}

5-4. 조회

  5-4-1. ID4인 사용자 정보 가져오기

GET 방식 http://localhost:3000/api/users/admin

  결과:

{
    "id": 1,
    "userid": 'admin',
    "username": "관리자",
    "email": "admin@example.com",
    "password": "1234"
}

  5-4-2. 전체 사용자 정보 가져오기

GET 방식 http://localhost:3000/api/users


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
