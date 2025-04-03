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

CREATE TABLE board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  views INT DEFAULT 0,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_file (
  id INT PRIMARY KEY AUTO_INCREMENT,
  board_id INT, 
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size int,
  file_path VARCHAR(255)
);

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

# 1.서버실행방법
1. aws 운영실행
pm2 start npm --name myserver -- run prd

2. 종료
*pm으로 떠있는 프로세서 종료
pm2 stop all

*pm2 list(목록보기)
pm2 delete myserver(myserver 목록지우기)

3. 커밋된 소스 강제로 가져오기
3-1. git pull 받을 목록을 repository 에서 업데이트
git fetch --all
3-2. git reset 으로 head를 최신으로 가리킨다
git reset --hard origin
3-3. git pull 로 확인
git pull

# 2.Docker로 실행방법
1. docker 설치

2. git clone 내소스URL
  2-1. 환경파일(.env.prd) 추가

3. Docker파일만들기
Dockerfile

4. docker빌드
docker build -t my-app . 

5. docker실행
docker run -p 5173:5173 -p 3000:3000 my-app

6.자동빌드
crontab -e

#### 매일 23시 1분에 PM2 서버 중지
20 15 * * * bash -lc '(pm2 delete myserver || true)' >> /home/ec2-user/gpt_board/cron.log 2>&1

#### 매일 23시 2분에 Git 저장소 업데이트
21 15 * * * bash -lc 'cd /home/ec2-user/gpt_board && git pull origin main' >> /home/ec2-user/gpt_board/cron.log 2>&1

#### 매일 23시 3분에 PM2 서버 시작 (업데이트된 코드로)
22 15 * * * bash -lc 'cd /home/ec2-user/gpt_board && pm2 start npm --name myserver -- run prd' >> /home/ec2-user/gpt_board/cron.log 2>&1
