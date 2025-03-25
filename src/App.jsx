import React, { useState } from "react";
import MenuTree from "./MenuTree";
import Board from "./Board";
import BoardList from "./BoardList";
import User from "./User";
import Images from "./Images";
import Visitors from "./Visitors";
import GptSummary from "./GptSummary";
import WebCrawling from "./WebCrawling";
import CrawlingNews from "./CrawlingNews";
import ExcelUpload from "./ExcelUpload";
import ExcelDownload from "./ExcelDownload";
import ExcelList from "./ExcelList";
import Map from "./Map";
import GoogleTrends from "./GoogleTrends";
import TypingGame from "./TypingGame";

const menuData = [
    { "id": 10, "menuid": "M001", "menuname": "시스템관리", "depth": 0, "url": "" },
    { "id": 11, "menuid": "M00101", "menuname": "메뉴관리", "depth": 1, "url": "menuTree" },
    { "id": 12, "menuid": "M00102", "menuname": "사용자관리", "depth": 1, "url": "user" },

    { "id": 20, "menuid": "M002", "menuname": "게시판관리", "depth": 0, "url": "" },
    { "id": 21, "menuid": "M00201", "menuname": "XML 게시판", "depth": 1, "url": "board" },
    { "id": 22, "menuid": "M00202", "menuname": "DB 게시판", "depth": 1, "url": "BoardList" },
    { "id": 23, "menuid": "M00203", "menuname": "이미지 게시판", "depth": 1, "url": "Images" },

    { "id": 30, "menuid": "M003", "menuname": "외부연동관리", "depth": 0, "url": "" },
    { "id": 31, "menuid": "M00301", "menuname": "웹크롤링", "depth": 1, "url": "WebCrawling" },
    { "id": 32, "menuid": "M00302", "menuname": "최신뉴스", "depth": 1, "url": "CrawlingNews" },
    { "id": 33, "menuid": "M00303", "menuname": "redis", "depth": 1, "url": "Visitors" },
    { "id": 34, "menuid": "M00304", "menuname": "Gpt요약", "depth": 1, "url": "GptSummary" },
    { "id": 35, "menuid": "M00305", "menuname": "map", "depth": 1, "url": "Map" },
    { "id": 36, "menuid": "M00306", "menuname": "구글트렌드", "depth": 1, "url": "GoogleTrends" },

    { "id": 40, "menuid": "M004", "menuname": "유틸기능관리", "depth": 0, "url": "" },
    { "id": 41, "menuid": "M00401", "menuname": "ExcelUpload", "depth": 1, "url": "ExcelUpload" },
    { "id": 42, "menuid": "M00402", "menuname": "ExcelDownload", "depth": 1, "url": "ExcelDownload" },
    { "id": 43, "menuid": "M00403", "menuname": "Excel데이터", "depth": 1, "url": "Excellist" },

    { "id": 50, "menuid": "M005", "menuname": "게임", "depth": 0, "url": "" },
    { "id": 51, "menuid": "M00501", "menuname": "타자연습", "depth": 1, "url": "TypingGame" },
    { "id": 52, "menuid": "M00502", "menuname": "테트리스", "depth": 1, "url": "Tetris" },
    { "id": 53, "menuid": "M00503", "menuname": "타이핑연습", "depth": 1, "url": "Typing" }
];

const MenuItem = ({ item, onSelect, activeMenu, setActiveMenu, setNavigator }) => {
    const isOpen = activeMenu === item.menuid;

    const handleClick = () => {
        if (item.depth === 0) {
            setActiveMenu(isOpen ? null : item.menuid);
        }
        setNavigator(item.menuname);
        if (item.menuid === "M00101") {
            onSelect(<MenuTree />);
        } else if (item.menuid === "M00102") {
            onSelect(<User />);
        } else if (item.menuid === "M00201") {
            onSelect(<Board />);
        } else if (item.menuid === "M00202") {
            onSelect(<BoardList />);
        } else if (item.menuid === "M00203") {
            onSelect(<Images />);
        } else if (item.menuid === "M00301") {
            onSelect(<WebCrawling />);
        } else if (item.menuid === "M00302") {
            onSelect(<CrawlingNews />);
        } else if (item.menuid === "M00303") {
            onSelect(<Visitors />);
        } else if (item.menuid === "M00304") {
            onSelect(<GptSummary />);
        } else if (item.menuid === "M00305") {
            onSelect(<Map />);
        } else if (item.menuid === "M00306") {
            onSelect(<GoogleTrends />);
        } else if (item.menuid === "M00401") {
            onSelect(<ExcelUpload />);
        } else if (item.menuid === "M00402") {
            onSelect(<ExcelDownload />);
        } else if (item.menuid === "M00403") {
            onSelect(<ExcelList />);
        } else if (item.menuid === "M00501") {
            onSelect(<TypingGame />);
        } else if (item.menuid === "M00502") {
            onSelect(<iframe src="./etc/tetris.html" width="100%" height="100%" />); //tetris게임추가.react로 개발시 설치모듈 너무 많음
        } else if (item.menuid === "M00503") {
            onSelect(<iframe src="./etc/typing.html" width="100%" height="100%" />);
        } else {
            onSelect(null);
        }
    };

    return (
        <div>
            <div className="menu-item" onClick={handleClick}>
                {item.menuname}
            </div>
            {isOpen && item.children && item.children.length > 0 && (
                <div className="submenu">
                    {item.children.map(child => (
                        <MenuItem key={child.id} item={child} onSelect={onSelect} activeMenu={activeMenu} setActiveMenu={setActiveMenu} setNavigator={setNavigator} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Menu = ({ onSelect, setNavigator }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const menuMap = {};

    menuData.forEach(item => {
        menuMap[item.menuid] = { ...item, children: [] };
    });

    menuData.forEach(item => {
        if (item.depth > 0) {
            const parentId = item.menuid.substring(0, item.menuid.length - 2);
            if (menuMap[parentId]) {
                menuMap[parentId].children.push(menuMap[item.menuid]);
            }
        }
    });

    return (
        <div className="menu">
            {Object.values(menuMap).map(item => (
                item.depth === 0 && <MenuItem key={item.id} item={item} onSelect={onSelect} activeMenu={activeMenu} setActiveMenu={setActiveMenu} setNavigator={setNavigator} />
            ))}
        </div>
    );
};

const App = () => {
    const [content, setContent] = useState(null);
    const [navigator, setNavigator] = useState("홈");

    // 토큰 확인
    const jwtToken = localStorage.getItem("jwt");
    console.log("토큰:", jwtToken);
    let tokenParts = null;
    let payload = null;
    if (jwtToken != null) {
        // 토큰 분해
        tokenParts = jwtToken.split('.');
        // 페이로드 추출 (Base64 디코딩)
        payload = JSON.parse(atob(tokenParts[1]));
        console.log("사용자 정보:", payload);
    }

    const userLogOut = () => {
        localStorage.removeItem("jwt");
        setTimeout(() => window.location.href = "/login.html", 1000);
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo">AMBION</div>
                <nav className="nav">경로: {navigator}</nav>
                {payload ? (
                    <div className="logo">
                        <span>{payload.userid} 님 안녕하세요</span>
                        <button onClick={userLogOut} className="logout-button">로그아웃</button>
                    </div>
                ) : (
                    <div className="logo">
                        <button onClick={userLogOut} className="logout-button">로그인</button>
                    </div>
                )}
            </header>
            <div className="main-container">
                <div className="left-panel">
                    <Menu onSelect={setContent} setNavigator={setNavigator} />
                </div>
                <div className="right-panel">
                    {content || <p className="placeholder-text">메뉴를 선택하세요.</p>}
                </div>
            </div>
        </div>
    );
};

export default App;
