import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const chatbotUrl = import.meta.env.VITE_CHATBOT_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)


const api = axios.create({
  baseURL: chatbotUrl,
});

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: '안녕하세요! 무엇을 도와드릴까요?', sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to manage chat visibility
  const messagesEndRef = useRef(null);

  const generateResponse = async (userMessage) => {
    try {
      setIsLoading(true);
      const response = await api.post('/chat', { message: userMessage });
      return response.data.text;
    } catch (error) {
      console.error('Error fetching response:', error);
      return '서버 연결 중 오류가 발생했습니다. 다시 시도해 주세요.';
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputText;
    setInputText('');

    try {
      const botResponseText = await generateResponse(currentInput);
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: '응답 처리 중 오류가 발생했습니다.',
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div style={styles.chatPopupContainer}>
      {/* Toggle Button */}
      <button style={styles.toggleButton} onClick={toggleChat}>
        {isChatOpen ? '닫기' : '챗봇'}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.headerTitle}>챗봇</h1>
          </header>

          <div style={styles.messageList}>
            {messages.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.messageBubble,
                  ...(item.sender === 'user'
                    ? styles.userMessage
                    : styles.botMessage),
                }}
              >
                <span style={styles.messageText}>{item.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isLoading && (
            <div style={styles.loadingContainer}>
              <span className="loader" style={{ marginRight: 8 }}>
                ⏳
              </span>
              <span style={styles.loadingText}>응답 작성 중...</span>
            </div>
          )}

          <div style={styles.inputContainer}>
            <input
              type="text"
              style={styles.input}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              style={{
                ...styles.sendButton,
                ...(inputText.trim() === '' || isLoading
                  ? styles.disabledButton
                  : {}),
              }}
              onClick={sendMessage}
              disabled={inputText.trim() === '' || isLoading}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  chatPopupContainer: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000, // Ensure it's on top of other content
  },
  toggleButton: {
    backgroundColor: '#4a89dc',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  container: {
    width: 350, // Adjust width as needed
    height: 500, // Adjust height as needed
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4a89dc',
    padding: 16,
    textAlign: 'center',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
  },
  headerTitle: {
    margin: 0,
    color: '#fff',
  },
  messageList: {
    flex: 1,
    padding: 16,
    overflowY: 'auto',
    backgroundColor: '#f5f5f5',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    fontSize: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a89dc',
    color: '#fff',
    marginLeft: 'auto',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    border: '1px solid #e8e8e8',
    color: '#333',
    marginRight: 'auto',
  },
  messageText: {
    display: 'inline-block',
  },
  inputContainer: {
    display: 'flex',
    padding: 10,
    borderTop: '1px solid #e8e8e8',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    borderRadius: 20,
    border: '1px solid #e8e8e8',
    fontSize: 16,
    outline: 'none',
  },
  sendButton: {
    marginLeft: 10,
    padding: '10px 20px',
    borderRadius: 20,
    backgroundColor: '#4a89dc',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    color: '#666',
  },
  loadingText: {
    fontSize: 14,
  },
};

export default Chatbot;
