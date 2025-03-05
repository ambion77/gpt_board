import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ExcelUpload = () => {
    const [file, setFile] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [xmlData, setXmlData] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('파일을 선택하세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 첫 번째 행을 컬럼명으로 사용
            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // XML 변환
            const xml = jsonToXml(headers, rows);
            setXmlData(xml);

            // 서버로 XML 데이터 전송
            await axios.post(`${apiUrl}/api/excel/upload`, { xml });

            // 테이블 데이터 설정
            setTableData([headers, ...rows]);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSave = async () => {
        if (!file) {
            alert('파일을 선택하세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 첫 번째 행을 컬럼명으로 사용
            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // XML 변환
            const xml = jsonToXml(headers, rows);
            setXmlData(xml);

            // 서버로 XML 데이터와 파일 이름 전송
            await axios.post(`${apiUrl}/api/excel/save`, { xml, fileName: file.name });
            
            // 테이블 데이터 설정
            setTableData([headers, ...rows]);
        };
        reader.readAsArrayBuffer(file);
    };

    const jsonToXml = (headers, rows) => {
        let xml = '<root>';
        // 컬럼명 행 추가
        xml += '<row>';
        headers.forEach((header) => {
            xml += `<${header}>${header}</${header}>`;
        });
        xml += '</row>';

        // 데이터 행 추가
        rows.forEach((row) => {
            xml += '<row>';
            headers.forEach((header, index) => {
                xml += `<${header}>${row[index] || ''}</${header}>`;
            });
            xml += '</row>';
        });
        xml += '</root>';
        return xml;
    };

    const handleBlob = async () => {
        if (!file) {
            alert('파일을 선택하세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target.result.split(',')[1]; // base64 데이터 추출

            // 서버로 파일 이름과 base64 데이터 전송
           // await axios.post('/api/upload', { fileName: file.name, fileData: base64Data });
            await axios.post(`${apiUrl}/api/excel/blob`, { fileName: file.name, fileData: base64Data});
            alert('BLOB 파일이 성공적으로 업로드되었습니다.');
        };
        reader.readAsDataURL(file); // 파일을 base64로 읽기
    };

    return (
        <div>
            <h1>엑셀 업로드</h1>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-4" />
            <button
                onClick={handleUpload}
            >
                xml파일저장
            </button>&nbsp;
            <button
                onClick={handleSave}
            >
                db 저장(컬럼별)
            </button>&nbsp;
            <button
                onClick={handleBlob}
            >
                db저장(BLOB)
            </button>
            <div>
                <table>
                    <thead>
                        <tr>
                            {tableData[0] && tableData[0].map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExcelUpload;