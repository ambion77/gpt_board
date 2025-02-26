import React, { useState, useEffect } from "react";
import BoardUpload from "./BoardUpload";

function BoardList() {
    const [boards, setBoards] = useState([]);
    const [selectedBoards, setSelectedBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [editingBoard, setEditingBoard] = useState(null);     // 수정 상태
    const [replyingBoard, setReplyingBoard] = useState(null);   // 답변 상태
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지
    const [pageSize, setPageSize] = useState(5);  // 한 페이지에 보여줄 게시물 수
    //const [totalBoards, setTotalBoards] = useState(0);  // 총 게시물 수
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        previousPage: null,
        nextPage: null,
        totalBoards: 0,
    });

    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)
    const [showUpload, setShowUpload] = useState(false);

    // 게시물 목록을 갱신하는 함수 (페이징 적용)
    // 게시물를 새로 불러오는 함수 (페이징을 고려한 새로고침)
    const refreshBoards = async (page = currentPage) => {
        try {
            const response = await fetch(`${apiUrl}/api/board/getBoardList?page=${page}&limit=${pageSize}`);
            const data = await response.json();
            setBoards(data.boards);
            
            if (data.pagination && data.pagination.totalPages) {
                setPagination(data.pagination);  // pagination 정보가 유효한 경우에만 설정
            } else {
                console.error("Pagination 데이터가 없거나 잘못되었습니다.");
            }
        } catch (error) {
          console.error("Error fetching boards:", error);
        }
    };

    useEffect(() => {
        refreshBoards(currentPage);  // 페이지 로드시 게시물 목록을 갱신
    }, [currentPage]);

    const handleCheckboxChange = (id) => {
        setSelectedBoards((prev) =>
            prev.includes(id) ? prev.filter((boardId) => boardId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedBoards.length === boards.length) {
            setSelectedBoards([]);  // 모두 선택된 상태라면 선택 해제
        } else {
            setSelectedBoards(boards.map((img) => img.id));  // 모든 게시물 선택
        }
    };

    const handleDelete = async () => {
        if (selectedBoards.length === 0) {
            alert("삭제할 게시물를 선택해주세요.");
            return;
        }

        try {
            // 현재 페이지와 limit을 가져옵니다.
            const page = currentPage; // 현재 페이지
            const limit = 5;  // 한 페이지에 보여줄 게시물 수
            const response = await fetch(`${apiUrl}/api/board/deleteBoards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    boardIds: selectedBoards,
                    page: page,
                    limit: limit }),
            });
            const data = await response.json();
            alert(data.message);
            // 삭제된 후 게시물 목록을 갱신합니다.
            refreshBoards(page);  // 삭제된 후 게시물 목록 갱신
            setSelectedBoards([]);  // 선택된 게시물 초기화
        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };

    const openPopup = (id) => {
        fetch(`${apiUrl}/api/board/getBoardInfo/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("서버 응답 데이터:", data[0]); // 🔍 데이터 구조 확인
                setSelectedBoard(data[0]);
            })
            .catch((error) => console.error("Error fetching board:", error));
    };

    const closePopup = () => {
        setSelectedBoard(null);
    };

    // 파일 다운로드 핸들러
    const handleDownload = async (fileId) => {
      try {
        // 1. 다운로드 시작 알림
        //alert(`다운로드를 시작합니다...`);
        
        // 2. API 호출
        const response = await fetch(`${apiUrl}/api/board/download/${fileId}`);
        
        console.log('response:', response);
        if (!response.ok) {
          throw new Error('파일 다운로드 실패');
        }

        // Get the file name from the response header (or use the file name returned by the backend)
        const contentDisposition = response.headers.get('Content-Disposition');
        console.log('contentDisposition:', contentDisposition);
        const contentType = response.headers.get('Content-Type');
        console.log('contentType:', contentType);
        const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `downloaded-file-${fileId}`;

        // Convert the response to a Blob
        const blob = await response.blob();

        // Create a download link and trigger the download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('다운로드 오류:', error);
        alert('파일 다운로드에 실패했습니다.');
      }
    };    

    // 페이지를 변경할 때 호출되는 함수
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;  // 페이지 범위 체크
        setCurrentPage(newPage);  // 현재 페이지 업데이트
        refreshBoards(newPage);   // 페이지 변경 시 게시물 갱신
    };

    // 게시물 수정 관련 상태
    const handleEdit = () => setEditingBoard(selectedBoard);
    const handleEditSubmit = async () => {
        await fetch(`${apiUrl}/api/board/updateBoard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingBoard.id, title: editingBoard.title, content: editingBoard.content }),
        });
        setEditingBoard(null);
        refreshBoards(currentPage);
    };

    // 답변 관련 상태
    const handleReply = () => {
        setReplyingBoard({
            title: "",
            content: "",
            parent_id: selectedBoard.id,
            depth: selectedBoard.depth + 1, // 부모의 depth + 1
        });
    };
    
    const handleReplySubmit = async () => {
        await fetch(`${apiUrl}/api/board/addReply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: replyingBoard.title, content: replyingBoard.content, parent_id: replyingBoard.parent_id }),
        });
        setReplyingBoard(null);
        refreshBoards(currentPage);
    };

    return (
        <div>
            <h1>📋 게시물 목록</h1>
            <div className="board-upload">
                <div><h3>DB 데이터를 게시물로 불러옴</h3></div>
                <div className="marginLeft">
                  <button onClick={() => setShowUpload(true)}>추가</button>&nbsp;
                  <button onClick={handleDelete}>삭제</button>
                </div>
            </div>

            {/* 게시물 목록 테이블 */}
            <table className="board-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedBoards.length === boards.length}  // 모든 게시물가 선택되었을 때 체크
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>ID</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>조회수</th>
                        <th>생성일</th>
                    </tr>
                </thead>
                <tbody>
                    {boards.map((img) => (
                        <tr key={img.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedBoards.includes(img.id)}
                                    onChange={() => handleCheckboxChange(img.id)}
                                />
                            </td>
                            <td>{img.id}</td>
                            <td><a href="#" className="post-title" onClick={() => openPopup(img.id)}>{img.title}</a></td>
                            <td>
                                {img.author}
                            </td>
                            <td>{img.views}</td>
                            <td>
                                {img.created_date}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이지 네비게이션 */}
            <div className="pageArea">
                {pagination.previousPage && (
                    <button onClick={() => handlePageChange(pagination.previousPage)}>이전</button>
                )}
                &nbsp;&nbsp;<span> {pagination.currentPage || 1} / {pagination.totalPages || 1} </span>&nbsp;&nbsp;{/* 값이 없을 경우 1로 기본 설정 */}
                {pagination.nextPage && (
                    <button onClick={() => handlePageChange(pagination.nextPage)}>다음</button>
                )}
            </div>

            {/* 게시물 업로드 팝업 */}
            {showUpload && (
              <BoardUpload 
                onUploadSuccess={() => {
                  refreshBoards();
                  setShowUpload(false);
                }}
                onClose={() => setShowUpload(false)}
              />
            )}

            {/* 상세 게시물 팝업 */}
            {selectedBoard && (
                <div className="board-popup">
                    <div className="board-popup-content">
                        <div><span className="close-btn" onClick={closePopup}>✖</span></div>
                        <h2>{selectedBoard.title}</h2>
                        <p>{selectedBoard.content}</p>
                        <button onClick={handleEdit}>수정</button>
                        <button onClick={handleReply}>답변</button>
                        {/* selectedBoard.file_id가 있을 때만 버튼을 보여줌 */}
                        {selectedBoard.file_id && (                      
                        <div><button className="download-btn" onClick={() => handleDownload(selectedBoard.id)}>📥 다운로드</button></div>
                        )}
                    </div>
                </div>
            )}
            {editingBoard && (
                <BoardUpload
                    title={editingBoard.title}
                    content={editingBoard.content}
                    onClose={() => setEditingBoard(null)}
                    onUploadSuccess={() => {
                        setEditingBoard(null);
                        refreshBoards(currentPage);
                    }}
                />
            )}
            {replyingBoard && (
                <BoardUpload
                    parentId={replyingBoard.parent_id}
                    onClose={() => setReplyingBoard(null)}
                    onUploadSuccess={() => {
                        setReplyingBoard(null);
                        refreshBoards(currentPage);
                    }}
                />
            )}
        </div>
    );
}

export default BoardList;
