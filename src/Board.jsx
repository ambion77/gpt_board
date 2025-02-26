import React, { useState, useEffect } from 'react';
import './Board.css';

function Board() {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [isReplyPopupOpen, setIsReplyPopupOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [selectAll, setSelectAll] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

    useEffect(() => {
        loadPosts(currentPage);
    }, [currentPage]);

    const loadPosts = (page) => {
        fetch(`${apiUrl}/posts?page=${page}`)
            .then(response => response.json())
            .then(data => {
                setPosts(data.posts);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
            });
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        setPosts(posts.map(post => ({ ...post, selected: !selectAll })));
    };

    const toggleSelectPost = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, selected: !post.selected } : post));
    };

    const openPopup = (postId) => {
        fetch(`${apiUrl}/post/${postId}`)
            .then(response => response.json())
            .then(post => {
                setPopupData(post);
                setIsPopupOpen(true);
            });
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setIsCreatePopupOpen(false);
        setIsReplyPopupOpen(false);

         // 팝업 닫을때 모든 입력값 초기화
        setNewPost({ title: '', content: '' });
        setReplyContent('');

        loadPosts(currentPage); // Reload posts after closing popup
    };

    const createPost = () => {
        if (!newPost.title || !newPost.content) {
            alert("⚠️ 제목, 내용을 모두 입력해주세요.");
            return;
        }

        if (newPost.title.length > 50) {
            alert("⚠️ 제목은 50글자를 초과할 수 없습니다.");
            return;
        }

        if (newPost.content.length > 1000) {
            alert("⚠️ 내용은 1000글자를 초과할 수 없습니다.");
            return;
        }

        fetch(`${apiUrl}/createPosts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
            body: JSON.stringify(newPost),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closePopup();
        });
    };

    const updatePost = () => {
        const updatedPost = { ...popupData, title: document.getElementById('editTitle').value, content: document.getElementById('editContent').value };

        fetch(`${apiUrl}/updatePosts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
            body: JSON.stringify(updatedPost),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closePopup();
        });
    };

    const deletePost = () => {
        if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

        fetch(`${apiUrl}/deletePost/${popupData.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closePopup();
        });
    };

    const openReplyPopup = (postId) => {
        setIsReplyPopupOpen(true);
    };

    const submitReply = () => {
        if (!replyContent) {
            alert("⚠️ 답변 내용을 입력해주세요.");
            return;
        }

        if (replyContent.length > 1000) {
            alert("⚠️ 답변 내용은 1000글자를 초과할 수 없습니다.");
            return;
        }

        const reply = { postId: popupData.id, content: replyContent };

        fetch(`${apiUrl}/addReply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
            body: JSON.stringify(reply),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closePopup();
        });
    };

    const deleteSelectedPosts = () => {
        //const checkedBoxes = document.querySelectorAll(".post-checkbox:checked");
        //const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
        const selectedIds = posts.filter(post => post.selected).map(post => post.id);

        if (selectedIds.length === 0) {
            alert("❗ 삭제할 게시글을 선택하세요.");
            return;
        }

        fetch(`${apiUrl}/deletePosts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
            body: JSON.stringify({ ids: selectedIds }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadPosts(currentPage);
        });
    };

    const handleTitleChange = (e) => {
        setNewPost({ ...newPost, title: e.target.value });
    };

    const handleContentChange = (e) => {
        setNewPost({ ...newPost, content: e.target.value });
    };

    const handleReplyChange = (e) => {
        setReplyContent(e.target.value);
    };

    return (
        <div>
            <h1>질의응답 게시판</h1>
            <div className="board-upload">
                <div><h3>*xml파일로 게시판내용 저장</h3></div>
                <div className="marginLeft">
                    <button onClick={() => setIsCreatePopupOpen(true)} >새글</button>&nbsp;
                    <button onClick={deleteSelectedPosts} >삭제</button>
                </div>
            </div>
            <table id="postTable">
                <thead>
                    <tr>
                        <th><input type="checkbox" onChange={toggleSelectAll} checked={selectAll} /></th>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>조회수</th>
                        <th>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id}>
                            <td><input type="checkbox" checked={post.selected || false} onChange={() => toggleSelectPost(post.id)} /></td>
                            <td>{post.id}</td>
                            <td className="leftArea" style={{ paddingLeft: `${post.depth * 20}px` }}><a href="#" className="post-title" onClick={() => openPopup(post.id)}>{post.title}</a></td>
                            <td>{post.author}</td>
                            <td>{post.views}</td>
                            <td>{post.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div id="pagination" className="pageArea">
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button key={index} onClick={() => setCurrentPage(index + 1)} style={{ fontWeight: currentPage === index + 1 ? 'bold' : 'normal' }}>
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* 팝업 */}
            {isPopupOpen && (
                <div id="popupLayer" className="popup-layer">
                    <div className="popup-content">
                        <span className="close-btn" onClick={closePopup}>✖</span>
                        <h2><input type="text" id="editTitle" defaultValue={popupData.title} /></h2>
                        <textarea id="editContent" className="editTxtArea" defaultValue={popupData.content}></textarea>
                        <p>작성자: {popupData.author}</p>
                        <p>작성일: {popupData.date}</p>
                        <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={openReplyPopup}>답글</button>
                            <button onClick={updatePost}>수정</button>
                            <button onClick={deletePost}>삭제</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 새 글 작성 팝업 */}
            {isCreatePopupOpen && (
                <div id="popupLayer" className="popup-layer">
                    <div className="popup-content">
                        <span className="close-btn" onClick={closePopup}>✖</span>
                        <h2>새 글 작성</h2>
                        <input
                            type="text"
                            value={newPost.title}
                            onChange={handleTitleChange}
                            placeholder="제목 입력"
                            maxLength={100}
                        />
                        <textarea
                            value={newPost.content}
                            onChange={handleContentChange}
                            placeholder="내용 입력"
                            maxLength={1000}
                            className="addTxtArea"
                        ></textarea>
                        <div className="popup-buttons">
                            <button onClick={createPost} className="create-btn">등록</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 답변 작성 팝업 */}
            {isReplyPopupOpen && (
                <div id="popupLayer" className="popup-layer">
                    <div className="popup-content">
                        <span className="close-btn" onClick={closePopup}>✖</span>
                        <h2>답변 작성</h2>
                        <textarea
                            value={replyContent}
                            onChange={handleReplyChange}
                            placeholder="답변 입력"
                            maxLength={1000}
                            className="addTxtArea"
                        ></textarea>
                        <div className="popup-buttons">
                            <button onClick={submitReply} className="create-btn">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Board;
