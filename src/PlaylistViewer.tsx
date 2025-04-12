// 예시 React 컴포넌트 (axios 사용)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlaylistViewer() {
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2024-07-26'); // 예시 날짜

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      setError(null);
      setPlaylist([]); // 이전 데이터 초기화

      try {
        // 백엔드 API URL (Flask 서버 주소)
        const apiUrl = `http://127.0.0.1:5000/api/playlist?date=${selectedDate}`;
        const response = await axios.get(apiUrl);
        setPlaylist(response.data); // 성공 시 데이터 설정
      } catch (err) {
        console.error("API 호출 오류:", err);
        // 서버에서 보낸 에러 메시지 또는 일반 메시지 설정
        setError(err.response?.data?.error || err.message || '선곡표를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchPlaylist();
    }
  }, [selectedDate]); // selectedDate가 변경될 때마다 API 호출

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div>
      <h1>배철수의 음악캠프 선곡표</h1>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
      />

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}

      {playlist.length > 0 ? (
        <ul>
          {playlist.map((song, index) => (
            <li key={index}>
              {song.no} - {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      ) : (
        !loading && !error && <p>해당 날짜의 선곡표 정보가 없습니다.</p>
      )}
    </div>
  );
}

export default PlaylistViewer;
