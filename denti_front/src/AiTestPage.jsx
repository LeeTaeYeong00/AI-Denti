import { useState } from 'react'
import axios from 'axios'

const DAMAGE_LABEL_KR = {
  Breakage_3: '파손',
  Crushed_2: '찌그러짐',
  Scratch_0: '스크래치',
  Seperated_1: '이격',
}

function AiTestPage() {
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
      // Content-Type은 axios가 FormData 넣으면 자동으로 multipart boundary까지 설정하므로 직접 지정하지 않음
      const response = await axios.post('/api/test/analyze', formData)
      setResult(response.data)
    } catch (err) {
      console.error(err)
      setError('분석 요청 실패 - 서버 연결 상태를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>🔧 AI 파손 분석 테스트</h1>

      <div style={{ margin: '20px 0' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="미리보기"
          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '20px' }}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
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
                <th style={{ textAlign: 'right', padding: '8px' }}>예상 견적</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.details).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{DAMAGE_LABEL_KR[key] ?? key}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>{value.pixelArea.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>{value.estimatedCost.toLocaleString()}원</td>
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

export default AiTestPage