// FileUpload.jsx
import React, { useState } from 'react';

const BoardUpload = ({ onUploadSuccess, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert('제목과 내용은 필수 입력 항목입니다.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/api/board/create`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업로드 실패');
      }

      const result = await response.json();
      alert('게시물이 성공적으로 등록되었습니다');
      setTitle('');
      setContent('');
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
        <span className="close-btn" onClick={onClose}>✖</span> {/* onClose 사용 */}
        <h3>📤 새 게시물 작성</h3>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
            <label>제목</label>
            <input
                type="text"
                className='board_title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            </div>
            
            <div className="form-group">
            <label>내용</label>
            <textarea
                value={content}
                className='board_content'
                onChange={(e) => setContent(e.target.value)}
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

            <button type="submit">업로드</button>
        </form>
       </div> 
    </div>
  );
};

export default BoardUpload;