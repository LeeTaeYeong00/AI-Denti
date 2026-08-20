import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAiHistory } from '../../api/aiAPI'

export default function AiHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAiHistory()
        setHistory(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>내 분석 이력</h1>
      {history.length === 0 && <p>아직 분석한 내역이 없습니다.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.map((item) => (
          <Link
            key={item.analysisId}
            to={`/ai/history/${item.analysisId}`}
            style={{ display: 'flex', gap: '16px', border: '1px solid #ddd', borderRadius: '8px', padding: '12px', textDecoration: 'none', color: 'black' }}
          >
            {item.thumbnailUrl && (
              <img src={`http://localhost:8080${item.thumbnailUrl}`} alt="분석 이미지" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
            )}
            <div>
              <p>{new Date(item.createdAt).toLocaleString()}</p>
              <p style={{ fontWeight: 'bold' }}>{item.totalCost.toLocaleString()}원</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}