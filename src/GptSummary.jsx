import { useState } from "react";

function GptSummary() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:3000/api/gpt/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText }),
    });
    const data = await response.json();
    //setSummary(data.summary);
    setSummary(data);
  };

  return (
    <div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="텍스트를 입력하세요..."
      />
      <button onClick={handleSubmit}>요약하기</button>
      <div>
        <h3>요약 결과:</h3>
        <p>{summary}</p>
      </div>
    </div>
  );
}

export default GptSummary;
