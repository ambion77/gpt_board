-- MY_DATA.base64_images definition

CREATE TABLE `base64_images` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `image_name` varchar(255) NOT NULL,
  `file_name` varchar(100) NOT NULL,
  `base64_data` longtext NOT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `size` int DEFAULT NULL COMMENT '파일사이즈',
  PRIMARY KEY (`id`),
  KEY `idx_image_name` (`image_name`)
) ;


-- MY_DATA.board definition

CREATE TABLE `board` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author` varchar(100) NOT NULL,
  `views` int DEFAULT '0',
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `parent_id` int DEFAULT NULL,
  `depth` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.board_file definition

CREATE TABLE `board_file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.crawling definition

CREATE TABLE `crawling` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `author` varchar(255) NOT NULL,
  `crawled_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.excel_data definition

CREATE TABLE `excel_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `main_id` int DEFAULT NULL,
  `rownum` int DEFAULT NULL COMMENT 'rownum 0이면 컬럼명, 나머지는 데이터값',
  `title` varchar(100) DEFAULT NULL COMMENT '제목',
  `file_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '파일명',
  `column1` varchar(255) DEFAULT NULL,
  `column2` varchar(255) DEFAULT NULL,
  `column3` varchar(255) DEFAULT NULL,
  `column4` varchar(255) DEFAULT NULL,
  `column5` varchar(255) DEFAULT NULL,
  `column6` varchar(255) DEFAULT NULL,
  `column7` varchar(255) DEFAULT NULL,
  `column8` varchar(255) DEFAULT NULL,
  `column9` varchar(255) DEFAULT NULL,
  `column10` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.excel_file definition

CREATE TABLE `excel_file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL COMMENT '제목',
  `file_name` varchar(255) DEFAULT NULL,
  `file_data` longblob,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.news definition

CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `link` varchar(500) NOT NULL,
  `pub_date` datetime DEFAULT NULL,
  `crawled_date` datetime DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.users definition

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ;


-- MY_DATA.menu definition

CREATE TABLE `menu` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `menu_code` varchar(20) NOT NULL,
  `menu_name` varchar(255) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `depth` tinyint unsigned NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `menu_code` (`menu_code`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menu` (`menu_id`) ON DELETE CASCADE
) ;

INSERT INTO my_data.users
(id, userid, username, email, password)
VALUES(1,'admin','관리자', 'admin@example.com', '1234');

INSERT INTO my_data.users
(id, userid, username, email, password)
VALUES(2, 'guest','게스트', 'guest@example.com', '5678');