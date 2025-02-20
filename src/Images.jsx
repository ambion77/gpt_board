import React, { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";

function ImageList() {
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지
    const [pageSize, setPageSize] = useState(5);  // 한 페이지에 보여줄 이미지 수
    //const [totalImages, setTotalImages] = useState(0);  // 총 이미지 수
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        previousPage: null,
        nextPage: null,
        totalImages: 0,
    });

    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

    // 이미지 목록을 갱신하는 함수 (페이징 적용)
    // 이미지를 새로 불러오는 함수 (페이징을 고려한 새로고침)
    const refreshImages = async (page = currentPage) => {
        try {
            const response = await fetch(`${apiUrl}/api/image/getImageList?page=${page}&limit=${pageSize}`);
            const data = await response.json();
            setImages(data.images);
            
            if (data.pagination && data.pagination.totalPages) {
                setPagination(data.pagination);  // pagination 정보가 유효한 경우에만 설정
            } else {
                console.error("Pagination 데이터가 없거나 잘못되었습니다.");
            }
        } catch (error) {
        console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        refreshImages(currentPage);  // 페이지 로드시 이미지 목록을 갱신
    }, [currentPage]);

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
            // 현재 페이지와 limit을 가져옵니다.
            const page = currentPage; // 현재 페이지
            const limit = 5;  // 한 페이지에 보여줄 이미지 수
            const response = await fetch(`${apiUrl}/api/image/deleteImages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    imageIds: selectedImages,
                    page: page,
                    limit: limit }),
            });
            const data = await response.json();
            alert(data.message);
            // 삭제된 후 이미지 목록을 갱신합니다.
            refreshImages(page);  // 삭제된 후 이미지 목록 갱신
            setSelectedImages([]);  // 선택된 이미지 초기화
        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };

    const openPopup = (id) => {
        fetch(`${apiUrl}/api/image/getImageInfo/${id}`)
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

    // 페이지를 변경할 때 호출되는 함수
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;  // 페이지 범위 체크
        setCurrentPage(newPage);  // 현재 페이지 업데이트
        refreshImages(newPage);   // 페이지 변경 시 이미지 갱신
    };

    return (
        <div>
            <h1>📋 이미지 목록</h1>
            <div className="image-upload">
                <div><h3>base64로 저장된 데이터를 이미지로 불러옴</h3></div>
                <ImageUpload onUploadSuccess={refreshImages} />&nbsp;
                <button onClick={handleDelete}>삭제</button>
            </div>

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
