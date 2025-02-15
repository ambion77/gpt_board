import React, { useState } from "react";
import MenuTree from "./MenuTree";
import Board from "./Board";
import User from "./User";
//import "./Menu.css";

const menuData = [
    { "id": 1, "menuid": "M001", "menuname": "시스템관리", "depth": 0, "url": "" },
    { "id": 2, "menuid": "M00101", "menuname": "메뉴관리", "depth": 2, "url": "menuTree" },
    { "id": 3, "menuid": "M00102", "menuname": "사용자관리", "depth": 2, "url": "user" },
    { "id": 4, "menuid": "M0010201", "menuname": "사용자추가삭제", "depth": 3, "url": "user_add_del.html" },
    { "id": 5, "menuid": "M002", "menuname": "게시판관리", "depth": 0, "url": "" },
    { "id": 6, "menuid": "M00201", "menuname": "REACT 게시판", "depth": 1, "url": "board" }
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
                } else if (item.menuid === "M00201") {
                    onSelect(<Board />);
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

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo">MyApp</div>
                <nav className="nav">경로: {navigator}</nav>
                <button onClick={userLogOut} className="logout-button">로그아웃</button>
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

const userLogOut = () => {
    localStorage.removeItem("jwt");
    setTimeout(() => window.location.href = "/login.html", 1000); 
};

export default App;
