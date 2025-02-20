import React, { useRef } from "react";

function ImageUpload({ onUploadSuccess }) {
    const fileInputRef = useRef(null);
    
    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`${apiUrl}/api/image/uploadImage`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            alert(data.message);
            onUploadSuccess();
        } catch (error) {
            console.error("업로드 실패:", error);
        }
    };

    return (
        <div className="image-upload">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current.click()}>
                추가
            </button>
        </div>
    );
}

export default ImageUpload;