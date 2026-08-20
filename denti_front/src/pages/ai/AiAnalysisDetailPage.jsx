import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAiHistoryDetail } from '../../api/aiAPI'

const DAMAGE_LABEL_KR = {
  BREAKAGE: '파손',
  CRUSHED: '찌그러짐',
  SCRATCH: '스크래치',
  SEPARATED: '이격',
}

export default function AiAnalysisDetailPage() {
  const { analysisId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAiHistoryDetail(analysisId)
        setResult(data)
      } catch (err) {
        setError('분석 결과를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [analysisId])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>불러오는 중...</p>
  if (error) return <p style={{ textAlign: 'center', marginTop: '40px', color: 'red' }}>{error}</p>
  if (!result) return null

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>분석 결과 상세</h1>
      <p style={{ color: '#888' }}>{new Date(result.createdAt).toLocaleString()}</p>

      {result.imageUrls?.map((url) => (
        <img
          key={url}
          src={`http://localhost:8080${url}`}
          alt="분석 이미지"
          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', margin: '16px 0' }}
        />
      ))}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>파손 유형</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>파손 영역(px)</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>파손 비율</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>예상 견적</th>
          </tr>
        </thead>
        <tbody>
          {result.details.map((d) => (
            <tr key={d.damageType} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{DAMAGE_LABEL_KR[d.damageType] ?? d.damageType}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{d.pixelArea.toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{d.damagePercentage}%</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{d.estimatedCost.toLocaleString()}원</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: '16px', fontSize: '20px', fontWeight: 'bold', textAlign: 'right' }}>
        총 예상 수리비: {result.totalCost.toLocaleString()}원
      </p>
    </div>
  )
}