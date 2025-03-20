import { useEffect, useState } from "react";
import axios from "axios";

const GoogleTrends = () => {
  const [trends, setTrends] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

  useEffect(() => {
    axios.get(`${apiUrl}/api/googleTrends/trends`)
      .then((response) => setTrends(response.data))
      .catch((error) => console.error("Error fetching trends:", error));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-5">
      <h1 className="text-2xl font-bold mb-4">🔥 실시간 인기 검색어</h1>
      <ul className="bg-white shadow-md rounded-lg p-4">
        {trends.length > 0 ? (
          trends.map((trend, index) => (
            <li key={index} className="py-2 border-b last:border-0">
              <a href={trend.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {index + 1}. {trend.title}
              </a>
            </li>
          ))
        ) : (
          <p>데이터를 불러오는 중...</p>
        )}
      </ul>
    </div>
  );
};

export default GoogleTrends;
