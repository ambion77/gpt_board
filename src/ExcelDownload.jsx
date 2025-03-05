import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExcelDownload = () => {
    const [files, setFiles] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/excelDownload/files`);
                setFiles(response.data);
            } catch (error) {
                console.error('파일 목록 조회 실패:', error);
            }
        };

        fetchFiles();
    }, []);

    const handleDownload = async (id) => {
        try {
            const response = await axios.get(`${apiUrl}/api/excelDownload/download/${id}`, {
                responseType: 'blob', // 파일 다운로드를 위해 blob 타입으로 설정
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1].replace(/"/g, ''));
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
        }
    };

    return (
        <div>
            <h1>엑셀 파일 목록</h1>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>파일명</th>
                            <th>생성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td>
                                    {file.id}
                                </td>
                                <td>
                                    {file.title}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDownload(file.id)}
                                    >
                                        {file.file_name}
                                    </button>
                                </td>
                                <td>
                                    {new Date(file.created_date).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExcelDownload;