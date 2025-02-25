import React, { useState } from "react";
import MenuTree from "./MenuTree";
import Board from "./Board";
import BoardList from "./BoardList";
import User from "./User";
import Images from "./Images";
import Visitors from "./Visitors";
//import "./Menu.css";

const menuData = [
    { "id": 1, "menuid": "M001", "menuname": "시스템관리", "depth": 0, "url": "" },
    { "id": 2, "menuid": "M00101", "menuname": "메뉴관리", "depth": 2, "url": "menuTree" },
    { "id": 3, "menuid": "M00102", "menuname": "사용자관리", "depth": 2, "url": "user" },
    { "id": 4, "menuid": "M00103", "menuname": "이미지관리", "depth": 2, "url": "Images" },
    { "id": 5, "menuid": "M00104", "menuname": "redis", "depth": 2, "url": "Visitors" },
    { "id": 6, "menuid": "M002", "menuname": "게시판관리", "depth": 0, "url": "" },
    { "id": 7, "menuid": "M00201", "menuname": "XML REACT 게시판", "depth": 1, "url": "board" },
    { "id": 8, "menuid": "M00202", "menuname": "DB REACT 게시판", "depth": 1, "url": "BoardList" }
];

const MenuItem = ({ item, onSelect, activeMenu, setActiveMenu, setNavigator }) => {
    const isOpen = activeMenu === item.menuid;

    return (
        <div>
            <div className="menu-item" onClick={() => {
                setActiveMenu(isOpen ? null : item.menuid);
                setNavigator(item.menuname);
                if (item.menuid === "M00101") {
                    onSelect(<MenuTree />);
                }else if (item.menuid === "M00102") {
                    onSelect(<User />);
                }else if (item.menuid === "M00103") {
                    onSelect(<Images />);
                }else if (item.menuid === "M00104") {
                    onSelect(<Visitors />);        
                } else if (item.menuid === "M00201") {
                    onSelect(<Board />);
                } else if (item.menuid === "M00202") {
                    onSelect(<BoardList />);
                } else {
                    onSelect(null);
                }
            }}>
                {item.menuname}
            </div>
            {isOpen && item.children.length > 0 && (
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
    let tokenParts=null;
    let payload=null;
    if (jwtToken !=null) {
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
                <div className="logo">MyApp</div>
                <nav className="nav">경로: {navigator}</nav>
                {payload ? (
                    <div className="logo">
                        <span>{payload.userid} 님 안녕하세요</span>
                        <button onClick={userLogOut} className="logout-button">로그아웃</button>
                    </div>
                ):(
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
