import { useState, useEffect } from "react";

function Visitors() {
  const [visitors, setVisitors] = useState(0);
  const [userVisitors, setUserVisitors] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)
  
  useEffect(() => {
    fetch(`${apiUrl}/api/redis/visitors`)
      .then((res) => res.json())
      .then((data) => setVisitors(data))
      .catch((err) => console.error("데이터 불러오기 오류:", err));
  }, []);

  const jwtToken = `${localStorage.getItem("jwt")}`;
  console.log("jwt토큰:"+ jwtToken+"!!");
  if(jwtToken !== "null") {
    useEffect(() => {
      fetch(`${apiUrl}/api/redis/userVisitors`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jwt")}` },
            body: '',
        })
        .then((res) => res.json())
        .then((data) => setUserVisitors(data.visitCount))
        .catch((err) => console.error("데이터 불러오기 오류:", err));
    }, []);
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>👋 Redis를 이용한 방문자 카운터 계산</h1>
      <h2>현재까지 방문자 수: {visitors}</h2>
      {jwtToken && <h2>당신이 오늘 방문한 건수: {userVisitors}</h2>}
    </div>
  );
}

export default Visitors;
