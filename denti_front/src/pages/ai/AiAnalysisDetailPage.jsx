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

  if (loading) {
    return (
      <div className="page">
        <p style={{ textAlign: 'center' }}>불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <span className="eyebrow">AI DIAGNOSIS</span>
        <h1 style={{ fontSize: 28 }}>분석 결과 상세</h1>
        <p style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>

      {result.imageUrls?.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {result.imageUrls.map((url) => (
            <div className="scan-frame" key={url}>
              <span className="scan-frame__corner scan-frame__corner--tl" />
              <span className="scan-frame__corner scan-frame__corner--tr" />
              <span className="scan-frame__corner scan-frame__corner--bl" />
              <span className="scan-frame__corner scan-frame__corner--br" />
              <img
                src={`http://localhost:8080${url}`}
                alt="분석 이미지"
                style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, display: 'block' }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>파손 유형</th>
              <th className="num">파손 영역(px)</th>
              <th className="num">파손 비율</th>
              <th className="num">예상 견적</th>
            </tr>
          </thead>
          <tbody>
            {result.details.map((d) => (
              <tr key={d.damageType}>
                <td>{DAMAGE_LABEL_KR[d.damageType] ?? d.damageType}</td>
                <td className="num">{d.pixelArea.toLocaleString()}</td>
                <td className="num">{d.damagePercentage}%</td>
                <td className="num">{d.estimatedCost.toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: 16, fontSize: 20, fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          총 예상 수리비: {result.totalCost.toLocaleString()}원
        </p>
      </div>
    </div>
  )
}