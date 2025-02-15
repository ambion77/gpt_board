import React, { useEffect, useState } from "react";

const MenuTable = () => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/menu/menuTree"); // 백엔드 API 호출
        if (!response.ok) {
            throw new Error("데이터를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        //console.error("메뉴 데이터를 불러오는 중 오류 발생:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>데이터를 불러오는 중 오류 발생: {error.message}</p>;

  return (
    <div className="menu-container">
      <h2>메뉴 구조</h2>
      <table>
        <thead>
          <tr>
            <th>메뉴ID</th>
            <th>메뉴명</th>
            <th>URL</th>
            <th>depth</th>
            <th>경로</th>
          </tr>
        </thead>
        <tbody>
          {menuData.map(menu => (
            <tr key={menu.menu_id}>
              <td>{menu.menu_id}</td>
              <td style={{ paddingLeft: `${menu.depth * 20}px` }}>
                {menu.url ? (
                  <a href={menu.url}>{menu.menu_name}</a>
                ) : (
                  <span>{menu.menu_name}</span>
                )}
              </td>
              <td>{menu.url || '-'}</td>
              <td>{menu.depth || '-'}</td>
              <td>{menu.path || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MenuTable;
