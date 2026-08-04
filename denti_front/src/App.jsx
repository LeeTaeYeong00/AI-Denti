import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('백엔드 연결 중...')

  useEffect(() => {
    // vite.config.js에 프록시 설정을 해두었으므로 /api/health 로 바로 호출 가능
    axios.get('/api/health')
      .then((response) => {
        setMessage(response.data.message)
      })
      .catch((error) => {
        console.error('API 통신 에러:', error)
        setMessage('백엔드 서버와 연결 실패')
      })
  }, [])

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🚗 AI-Denti 프로젝트</h1>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>백엔드 연동 상태:</h3>
        <p style={{ color: '#007bff', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  )
}

export default App