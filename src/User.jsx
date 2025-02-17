import React, { useState, useEffect } from "react";

const User = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/users");
                if (!response.ok) {
                    throw new Error("데이터를 불러오는데 실패했습니다.");
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="user-container">
            <h1>사용자 정보</h1>
            <h3>*POSTMAN이용 API호출(예: http://localhost:3000/api/users)로 CRUD됨</h3>
            {isLoading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>아이디</th>
                            <th>사용자명</th>
                            <th>이메일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.userid}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default User;