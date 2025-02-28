import React, { useState, useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

const User = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showPopup, setShowPopup] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [newUser, setNewUser] = useState({ username: '', email: '', userid: '', password: '' });
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const usersPerPage = 5;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/users`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('사용자 데이터를 가져오는데 실패했습니다:', error);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
        );
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^~])[A-Za-z\d@$!%*?&#^~]{10,20}$/;
        return passwordRegex.test(password);
    };

    const handleAddUser = async () => {
        if (newUser.username && newUser.email && newUser.userid && newUser.password) {
            if (!validateEmail(newUser.email)) {
                setErrorMessage('유효한 이메일 주소를 입력하세요.');
                return;
            }

            if (!validatePassword(newUser.password)) {
                setErrorMessage('비밀번호는 영문, 숫자, 특수기호를 포함하여 10글자 이상이어야 합니다.');
                return;
            }

            const isDuplicate = users.some(
                (user) => user.userid === newUser.userid || user.email === newUser.email
            );

            if (isDuplicate) {
                setErrorMessage('이미 존재하는 사용자아이디 또는 이메일입니다.');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser),
                });
                if (response.ok) {
                    fetchUsers();
                    setNewUser({ username: '', email: '', userid: '', password: '' });
                    setShowAddPopup(false);
                    setErrorMessage('');
                }
            } catch (error) {
                console.error('사용자 추가에 실패했습니다:', error);
            }
        }
    };

    const handleDeleteUsers = async () => {
        try {
            await Promise.all(selectedUsers.map(async (id) => {
                const response = await fetch(`${apiUrl}/api/users/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('삭제 실패');
                }
            }));
            fetchUsers();
            setSelectedUsers([]);
        } catch (error) {
            console.error('사용자 삭제에 실패했습니다:', error);
        }
    };

    const handleUserClick = (user) => {
        setCurrentUser(user);
        setShowPopup(true);
    };

    const handleUserUpdate = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentUser),
            });
            if (response.ok) {
                fetchUsers();
                setShowPopup(false);
            }
        } catch (error) {
            console.error('사용자 수정에 실패했습니다:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

    // 전체 선택을 위한 새로운 함수 추가
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allUserIds = currentUsers.map(user => user.id);
            setSelectedUsers(allUserIds);
        } else {
            setSelectedUsers([]);
        }
    };

    return (
        <div className="container">
            <h1>사용자 목록</h1>
            <h3>*POSTMAN이용 API호출(예: http://localhost:3000/api/users)로 CRUD됨</h3>
            <div className="button-group">
                <button onClick={() => {
                    setNewUser({ username: '', email: '', userid: '', password: '' });
                    setShowAddPopup(true);
                }}>추가</button>&nbsp;
                <button onClick={handleDeleteUsers}>삭제</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                            />
                        </th>
                        <th>이름</th>
                        <th>사용자아이디</th>
                        <th>이메일</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((user) => (
                        <tr key={user.id} onClick={() => handleUserClick(user)}>
                            <td style={{ textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleCheckboxChange(user.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                            <td>{user.username}</td>
                            <td>{user.userid}</td>
                            <td>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {showPopup && currentUser && (
                <>
                    <div className="overlay"></div>
                    <div className="user_popup">
                        <h2>사용자 상세 정보</h2>
                        <label>
                            이름:
                            <input
                                type="text"
                                value={currentUser.username}
                                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                            />
                        </label>
                        <label>
                            사용자아이디:
                            <input
                                type="text"
                                value={currentUser.userid}
                                disabled
                            />
                        </label>
                        <label>
                            이메일:
                            <input
                                type="email"
                                value={currentUser.email}
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            />
                        </label>
                        <div className="button-container">
                            <button onClick={handleUserUpdate}>수정</button>
                            <button onClick={() => setShowPopup(false)}>닫기</button>
                        </div>
                    </div>
                </>
            )}

            {showAddPopup && (
                <>
                    <div className="overlay"></div>
                    <div className="user_popup">
                        <h2>사용자 추가</h2>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <label>
                            사용자명:
                            <input
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            />
                        </label>
                        <label>
                            이메일:
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </label>
                        <label>
                            사용자아이디:
                            <input
                                type="text"
                                value={newUser.userid}
                                onChange={(e) => setNewUser({ ...newUser, userid: e.target.value })}
                            />
                        </label>
                        <label>
                            비밀번호:
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </label>
                        <div className="button-group">
                            <button onClick={handleAddUser}>추가</button>
                            <button onClick={() => setShowAddPopup(false)}>닫기</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default User;