import React, { useState } from "react";

function ImageUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("파일을 선택해주세요.");
            return;
        }
        
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("http://localhost:3000/api/image/uploadImage", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            alert(data.message);
            onUploadSuccess(); // 업로드 후 이미지 목록 갱신
        } catch (error) {
            console.error("업로드 실패:", error);
        }
    };

    return (
        <div>
            <h2>📤 이미지 업로드</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>업로드</button>
        </div>
    );
}

export default ImageUpload;
