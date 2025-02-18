import React, { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";

function ImageList() {
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    // 이미지 목록을 갱신하는 함수
    const refreshImages = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/image/getImageList");
            const data = await response.json();
            console.log("서버 응답 데이터1:", data); // 🔍 데이터 구조 확인
            setImages(data);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedImages((prev) =>
            prev.includes(id) ? prev.filter((imageId) => imageId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedImages.length === images.length) {
            setSelectedImages([]);  // 모두 선택된 상태라면 선택 해제
        } else {
            setSelectedImages(images.map((img) => img.id));  // 모든 이미지 선택
        }
    };

    const handleDelete = async () => {
        if (selectedImages.length === 0) {
            alert("삭제할 이미지를 선택해주세요.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/image/deleteImages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageIds: selectedImages }),
            });
            const data = await response.json();
            alert(data.message);
            setImages(images.filter((img) => !selectedImages.includes(img.id)));
            setSelectedImages([]);
        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };

    useEffect(() => {
        refreshImages();  // 페이지 로드시 이미지 목록을 갱신
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
            <h1>📋 이미지 목록</h1>
            <div className="image-upload">
                <div><h3>base64로 저장된 데이터를 이미지로 불러옴</h3></div>
                <ImageUpload onUploadSuccess={refreshImages} />&nbsp;
                <button onClick={handleDelete}>삭제</button>
            </div>

            {/* 전체 선택 체크박스 */}
            
            {/* 이미지 목록 테이블 */}
            <table className="image-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedImages.length === images.length}  // 모든 이미지가 선택되었을 때 체크
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>ID</th>
                        <th>미리보기</th>
                        <th>파일명</th>
                        <th>가로</th>
                        <th>세로</th>
                        <th>파일사이즈</th>
                        <th>보기</th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img) => (
                        <tr key={img.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedImages.includes(img.id)}
                                    onChange={() => handleCheckboxChange(img.id)}
                                />
                            </td>
                            <td>{img.id}</td>
                            <td>
                                <img
                                    src={`data:image/jpeg;base64,${img.base64_data}`}
                                    alt={img.image_name}
                                    className="thumbnail"
                                />
                            </td>
                            <td>{img.file_name}</td>
                            <td>{img.width}</td>
                            <td>{img.height}</td>
                            <td>{img.size}</td>
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
                            style={{ 
                                ...(() => {
                                  const maxSize = 500;
                                  const originalWidth = selectedImage.width;
                                  const originalHeight = selectedImage.height;
                                  
                                  // 원본 크기가 300px 이하인 경우
                                  if (originalWidth <= maxSize && originalHeight <= maxSize) {
                                    return {
                                      width: `${originalWidth}px`,
                                      height: `${originalHeight}px`
                                    };
                                  }
                                  
                                  // 비율 계산 (더 긴 쪽을 300px로 고정)
                                  const scaleRatio = Math.min(
                                    maxSize / originalWidth,
                                    maxSize / originalHeight
                                  );
                                  
                                  return {
                                    width: `${Math.floor(originalWidth * scaleRatio)}px`,
                                    height: `${Math.floor(originalHeight * scaleRatio)}px`,
                                    maxWidth: `${maxSize}px`,
                                    maxHeight: `${maxSize}px`
                                  };
                                })()
                              }}
                        />
                        <button className="download-btn" onClick={downloadImage}>📥 다운로드</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageList;
