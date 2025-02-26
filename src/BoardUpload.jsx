import React, { useState, useEffect } from 'react';

const BoardUpload = ({ id=null,onUploadSuccess, onClose, title = "", content = "", parentId = null, depth = 0 }) => {
    const [inputTitle, setInputTitle] = useState(title);
    const [inputDepth, setDepth] = useState(depth);
    const [inputContent, setInputContent] = useState(content);
    const [file, setFile] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    // 추가: props가 변경될 때 상태 업데이트
    useEffect(() => {
        setInputTitle(title);
        setInputContent(content);
        setDepth(depth);
    }, [title, content, depth, parentId]); // 관련 props 변경 시 실행

    useEffect(() => {
        if (parentId) {
            setInputTitle(title && title.trim() !== "" ? `RE: ${title}` : "RE: (제목 없음)");
            setInputContent(content);
            setDepth(depth || 1); // depth가 없으면 기본값 1
        }
    }, [parentId, title, depth]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputTitle.trim() || !inputContent.trim()) {
            alert('제목과 내용은 필수 입력 항목입니다.');
            return;
        }

        const formData = new FormData();
        formData.append('title', inputTitle);
        formData.append('content', inputContent);
        formData.append('depth', inputDepth || 0); // depth가 undefined면 기본값 0

        if (file) formData.append('file', file);
        if (parentId) formData.append('parent_id', parentId);
        if (id) formData.append('id', id);

        console.log('id:', id);
        
        // API 엔드포인트 설정
        let apiEndpoint;
        if (id) {
            apiEndpoint = `${apiUrl}/api/board/updateBoard`;
        } else if (parentId) {
            apiEndpoint = `${apiUrl}/api/board/addReply`;
        } else {
            apiEndpoint = `${apiUrl}/api/board/create`;
        }

        console.log('apiEndpoint:', apiEndpoint);
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '업로드 실패');
            }

            alert(id ? '게시물이 수정되었습니다.' : (parentId ? '답글이 등록되었습니다.' : '게시물이 등록되었습니다.'));
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
                <h3>{parentId ? "✍ 답글 작성" : "📤 새 게시물 작성"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            className='board_title'
                            value={inputTitle}
                            onChange={(e) => setInputTitle(e.target.value)}
                            required
                            //readOnly={!!parentId} // 답글 작성 시 제목 고정
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
                    <div className='align-right'>
                        <button type="submit" >{parentId ? "답글 등록" : "저장"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardUpload;
