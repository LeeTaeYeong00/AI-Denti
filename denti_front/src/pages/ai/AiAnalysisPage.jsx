import { useState } from 'react'
import { analyzeImage } from '../../api/aiAPI'

const DAMAGE_LABEL_KR = {
  BREAKAGE: '파손',
  CRUSHED: '찌그러짐',
  SCRATCH: '스크래치',
  SEPARATED: '이격',
}

export default function AiAnalysisPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('이미지를 먼저 선택해주세요.')
      return
    }
    const formData = new FormData()
    formData.append('image', file)
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeImage(formData)
      setResult(data)
    } catch (err) {
      setError('분석 요청 실패 - 서버 연결 상태를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>🔧 AI 파손 분석</h1>
      <div style={{ margin: '20px 0' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {previewUrl && (
        <img src={previewUrl} alt="미리보기" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '20px' }} />
      )}
      <button onClick={handleSubmit} disabled={loading || !file} style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '분석 중...' : '분석 요청'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3>분석 결과</h3>
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
      )}
    </div>
  )
}