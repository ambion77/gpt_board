import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WebCrawling() {
  const [quotes, setQuotes] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

  useEffect(() => {
      axios.get(`${apiUrl}/api/crawling/scrape`)
          .then(response => setQuotes(response.data))
          .catch(error => console.error("Error fetching quotes:", error));
  }, []);

  return (
      <div>
          <h1>📜 웹크롤링(quotes.toscrape.com 웹스크랩)</h1>
          {quotes.length > 0 ? (
              <ul>
                  {quotes.map((quote, index) => (
                      <li key={index}>
                          <blockquote>"{quote.text}"</blockquote>
                          <cite>- {quote.author}</cite>
                      </li>
                  ))}
              </ul>
          ) : (
              <p>Loading quotes...</p>
          )}
      </div>
  );
}

export default WebCrawling;
