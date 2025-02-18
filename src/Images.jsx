import React, { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";

function ImageList() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    // 이미지 목록을 갱신하는 함수
    const refreshImages = () => {
        // 이미지 목록 다시 불러오기
        useEffect(() => {
            fetch("http://localhost:3000/api/image/getImageList") // ID와 제목만 가져오기
                .then((response) => response.json())
                .then((data) => {
                    console.log("서버 응답 데이터1:", data); // 🔍 데이터 구조 확인
                    setImages(data);
                })
                .catch((error) => console.error("Error fetching images:", error));
        }, []);
    };

    useEffect(() => {
        fetch("http://localhost:3000/api/image/getImageList") // ID와 제목만 가져오기
            .then((response) => response.json())
            .then((data) => {
                console.log("서버 응답 데이터1:", data); // 🔍 데이터 구조 확인
                setImages(data);
            })
            .catch((error) => console.error("Error fetching images:", error));
    }, []);

    const openPopup = (id) => {
        fetch(`http://localhost:3000/api/image/getImageInfo/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("서버 응답 데이터:", data[0]); // 🔍 데이터 구조 확인
                setSelectedImage(data[0]);
            })
            .catch((error) => console.error("Error fetching image:", error));
    };

    const closePopup = () => {
        setSelectedImage(null);
    };

    const downloadImage = () => {
        if (!selectedImage || !selectedImage.base64_data) {
            console.error("❌ 오류: base64 데이터가 없습니다.");
            return;
        }

        try {
            // "data:image/jpeg;base64," 제거
            const cleanBase64 = selectedImage.base64_data.replace(/^data:image\/\w+;base64,/, "");

            const byteCharacters = atob(cleanBase64); // Base64 디코딩
            const byteNumbers = new Array(byteCharacters.length)
                .fill(0)
                .map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "image/jpeg" });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = selectedImage.file_name || "download.jpg"; // 파일명 설정
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("❌ Base64 디코딩 오류:", error);
        }
    };

    return (
        <div>
            <ImageUpload onUploadSuccess={refreshImages} />
            <h1>📋 이미지 목록</h1>
            <h3>base64로 저장된 데이터를 이미지로 불러옴</h3>

            {/* 이미지 목록 테이블 */}
            <table className="image-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>미리보기</th>
                        <th>이미지 이름</th>
                        <th>파일명</th>
                        <th>보기</th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img) => (
                        <tr key={img.id}>
                            <td>{img.id}</td>
                            <td>
                                <img
                                    src={`data:image/jpeg;base64,${img.base64_data}`}
                                    alt={img.image_name}
                                    className="thumbnail"
                                />
                            </td>
                            <td>{img.image_name}</td>
                            <td>{img.file_name}</td>
                            <td>
                                <button className="view-btn" onClick={() => openPopup(img.id)}>🔍 보기</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 상세 이미지 팝업 */}
            {selectedImage && (
                <div className="img-popup">
                    <div className="img-popup-content">
                        <span className="close-btn" onClick={closePopup}>✖</span>
                        <h2>{selectedImage.image_name}</h2>
                        <img
                            src={`data:image/jpeg;base64,${selectedImage.base64_data}`}
                            alt={selectedImage.image_name}
                            style={{ width: `${selectedImage.width}px`, height: `${selectedImage.height}px` }}
                        />
                        <button className="download-btn" onClick={downloadImage}>📥 다운로드</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageList;
