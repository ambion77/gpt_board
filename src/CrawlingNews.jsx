import { useState, useEffect } from 'react';

const CrawlingNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiUrl = import.meta.env.VITE_API_URL;    // Vite 환경 변수 사용(꼭VITE라는명으로 시작해야함)

  // 뉴스 데이터 가져오기
  const fetchNews = async (page = 1) => {
      try {
          setLoading(true);
          setError(null);
          const response = await fetch(`${apiUrl}/api/crawlingNews/news?page=${page}&limit=10`); // 페이지와 리미트 전달
          const data = await response.json();
          
          setNews(data.news);
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
      } catch (error) {
          console.error('뉴스 데이터 가져오기 실패:', error);
          setError('뉴스 데이터를 불러오는데 실패했습니다.');
          setNews([]);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]); // currentPage가 변경될 때마다 fetchNews 실행
  
  // 크롤링 실행
  const handleCrawling = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/api/crawlingScheduleRoutes/crawling`);
      await fetchNews();
    } catch (error) {
      console.error('크롤링 실행 실패:', error);
      setError('크롤링 실행에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div>
      <div>
        <h1>최신 뉴스 게시판</h1>
        <div className="board-upload">
          <div><h3>*최신뉴스를 하루에 한번 스케줄링으로 가져오고,버튼클릭시 현재뉴스 가져옴. </h3></div>
          <div className='marginLeft'>
            <button
              onClick={handleCrawling}
              disabled={loading}
            >
              {loading ? '처리중...' : '뉴스 크롤링'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div>
          {error}
        </div>
      )}

      {loading ? (
        <div>로딩중...</div>
      ) : news.length === 0 ? (
        <div>뉴스 데이터가 없습니다.</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>링크</th>
                <th>발행일</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      링크
                    </a>
                  </td>
                  <td>
                    {new Date(item.pub_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 버튼 */}
      <div className="text_align_center">
          <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage == 1}
          >
              이전
          </button>
          &nbsp;<span className="self-center">{currentPage} / {totalPages}</span>&nbsp;
          <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage == totalPages}
          >
              다음
          </button>
      </div>
    </div>
  );
  


};

export default CrawlingNews;