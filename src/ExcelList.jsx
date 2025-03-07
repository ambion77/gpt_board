import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExcelList = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modifiedCells, setModifiedCells] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;   

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/excel/datalist`);
                setFiles(response.data);
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };
        fetchFiles();
    }, []);

    const handleFileClick = async (file) => {
        setSelectedFile(file);
        const response = await axios.get(`${apiUrl}/api/excel/detail?title=${file.title}&file_name=${file.file_name}`);
        setData(response.data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setData([]);
        setModifiedCells({});
        setSelectedRows([]);
    };

    const handleCellChange = (rowId, column, value) => {
        setModifiedCells((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [column]: value,
            },
        }));
    };

    const handleCheckboxChange = (id) => {
        setSelectedRows((prev) => {
            if (prev.includes(id)) {
                return prev.filter((rowId) => rowId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleDeleteSelected = async () => {
        await axios.post(`${apiUrl}/api/excel/delete-rows`, { ids: selectedRows });
        setData((prev) => prev.filter((row) => !selectedRows.includes(row.id)));
        setSelectedRows([]);
    };

    const handleUpdate = async () => {
        await axios.post(`${apiUrl}/api/excel/update-rows`, modifiedCells);
        setModifiedCells({});
        closeModal(); // 수정 후 모달 닫기
    };

    return (
        <div>
            <h1>Excel 파일 목록</h1>
            <table>
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>제목</th>
                        <th>생성일자</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id} onClick={() => handleFileClick(file)}>
                            <td>{file.main_id}</td>
                            <td>{file.title}</td>
                            <td>{file.created_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='space_between'>
                            <div>
                                <h2>{selectedFile.title}</h2>
                            </div>
                            <div>
                                <button onClick={handleUpdate}>수정</button>&nbsp;
                                <button onClick={handleDeleteSelected}>삭제</button>&nbsp;
                                <button onClick={closeModal}>닫기</button>
                            </div>
                        </div>                        
                        <table>
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>컬럼1</th>
                                    <th>컬럼2</th>
                                    <th>컬럼3</th>
                                    <th>컬럼4</th>
                                    <th>컬럼5</th>
                                    <th>컬럼6</th>
                                    <th>컬럼7</th>
                                    <th>컬럼8</th>
                                    <th>컬럼9</th>
                                    <th>컬럼10</th>
                                    {/* 추가 컬럼 헤더 */}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleCheckboxChange(row.id)}
                                            />
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column1 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column1}
                                                    onChange={(e) => handleCellChange(row.id, 'column1', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column2 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column2}
                                                    onChange={(e) => handleCellChange(row.id, 'column2', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column3 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column3}
                                                    onChange={(e) => handleCellChange(row.id, 'column3', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column4 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column4}
                                                    onChange={(e) => handleCellChange(row.id, 'column4', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column5 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column5}
                                                    onChange={(e) => handleCellChange(row.id, 'column5', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column6 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column6}
                                                    onChange={(e) => handleCellChange(row.id, 'column6', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column7 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column7}
                                                    onChange={(e) => handleCellChange(row.id, 'column7', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column8 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column8}
                                                    onChange={(e) => handleCellChange(row.id, 'column8', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column9 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column9}
                                                    onChange={(e) => handleCellChange(row.id, 'column9', e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {row.rownum === 0 ? (
                                                row.column10 // 컬럼명은 수정 불가
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={row.column10}
                                                    onChange={(e) => handleCellChange(row.id, 'column10', e.target.value)}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelList;