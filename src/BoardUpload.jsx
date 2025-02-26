import React, { useState, useEffect } from 'react';

const BoardUpload = ({ onUploadSuccess, onClose, title = "", content = "", parentId = null, depth = 0 }) => {
    const [inputTitle, setInputTitle] = useState(title);
    const [inputContent, setInputContent] = useState(content);
    const [file, setFile] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (parentId) {
            setInputTitle(`RE: ${title}`); // 답변 시 제목 자동 입력
        }
    }, [parentId, title]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputTitle || !inputContent) {
            alert('제목과 내용은 필수 입력 항목입니다.');
            return;
        }

        const formData = new FormData();
        formData.append('title', inputTitle);
        formData.append('content', inputContent);
        formData.append('depth', depth); // depth 추가
        if (file) formData.append('file', file);

        let apiEndpoint = parentId ? `${apiUrl}/api/board/addReply` : `${apiUrl}/api/board/create`;
        if (parentId) {
            formData.append('parent_id', parentId);
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '업로드 실패');
            }

            alert(parentId ? '답변이 성공적으로 등록되었습니다' : '게시물이 성공적으로 등록되었습니다');
            setInputTitle('');
            setInputContent('');
            setFile(null);
            onUploadSuccess();
        } catch (error) {
            console.error('업로드 오류:', error);
            alert(error.message);
        }
    };

    return (
        <div className="board-popup">
            <div className="board-popup-content">
                <span className="close-btn" onClick={onClose}>✖</span>
                <h3>{parentId ? "✍ 답변 작성" : "📤 새 게시물 작성"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            className='board_title'
                            value={inputTitle}
                            onChange={(e) => setInputTitle(e.target.value)}
                            required
                            readOnly={!!parentId} // 답변 작성 시 제목 고정
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>내용</label>
                        <textarea
                            value={inputContent}
                            className='board_content'
                            onChange={(e) => setInputContent(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>파일 첨부</label>
                        <input
                            type="file"
                            className='board_file'
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    <button type="submit">{parentId ? "답변 등록" : "업로드"}</button>
                </form>
            </div>
        </div>
    );
};

export default BoardUpload;
