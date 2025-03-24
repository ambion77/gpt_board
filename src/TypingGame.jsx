import React, { useState, useEffect } from "react";

const TypingGame = () => {
  const [proverbs, setProverbs] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentSentence, setCurrentSentence] = useState("");
  const [inputText, setInputText] = useState("");
  const [speed, setSpeed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [errorText, setErrorText] = useState("");
  const levelSpeeds = Array.from({ length: 50 }, (_, i) => (i + 1) * 10);

  useEffect(() => {
    fetch("/proverbs.json")
      .then((response) => response.json())
      .then((data) => {
        setProverbs(data.proverbs);
        // 초기 명언 무작위 선택
        const randomIndex = Math.floor(Math.random() * data.proverbs.length);
        setCurrentSentence(data.proverbs[randomIndex]);
      })
      .catch((error) => console.error("Error loading proverbs:", error));
    
      const handleKeyPress = (e) => {
        if (showPopup && e.key === 'Enter') {
          setShowPopup(false);
        }
      };
  
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);  
  }, [showPopup]);

  const handleChange = (e) => {
    if (!startTime) setStartTime(Date.now());
    setInputText(e.target.value);
  };

  const highlightErrors = (input, correct) => {
    let result = "";
    for (let i = 0; i < Math.max(input.length, correct.length); i++) {
      if (input[i] !== correct[i]) {
        result += `<span style='color: red;'>${correct[i] || "_"}</span>`;
      } else {
        result += correct[i] || "";
      }
    }
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const elapsedTime = (Date.now() - startTime) / 1000;
    let typedSpeed = Math.round((inputText.length / elapsedTime) * 60);
    
    if (inputText !== currentSentence) {
      typedSpeed -= 10; // 오타 발생 시 -10 타
      setErrorText(highlightErrors(inputText, currentSentence));
      setShowPopup(true);
    }
    
    setSpeed(typedSpeed);

    const getNewProverb = () => {
      const newRandomIndex = Math.floor(Math.random() * proverbs.length);
      setCurrentSentence(proverbs[newRandomIndex]);
    };
    
    if (typedSpeed >= levelSpeeds[currentLevel - 1]) {
      if (currentLevel < 50) {
        setCurrentLevel(currentLevel + 1);
        getNewProverb();
        setInputText("");
        setStartTime(null);
        setShowPopup(false);
      } else {
        alert("축하합니다! 모든 단계를 완료했습니다.");
      }
    } else {
      alert("속도가 부족합니다. 다시 도전하세요!");
      getNewProverb(); // 실패 시에도 새로운 명언 선택
      setInputText("");
      setStartTime(null);
    }
  };

  return (
    <div>
      <h1>타자 연습 - 단계 {currentLevel}</h1>
      <p>목표 속도: {levelSpeeds[currentLevel - 1]}타/분</p>
      <p>{currentSentence}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          placeholder="문장을 입력하세요"
        />
        <button type="submit">확인</button>
      </form>
      <p>현재 속도: {speed}타/분</p>
      {showPopup && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "20px",
          border: "1px solid black",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          zIndex: 1000
        }}>
          <p><strong>틀린 글자:</strong></p>
          <p dangerouslySetInnerHTML={{ __html: errorText }}></p>
          <button onClick={() => setShowPopup(false)}
            autoFocus >닫기</button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;
