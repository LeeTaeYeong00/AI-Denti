import { useEffect, useState } from 'react'
import {
  createReview,
  updateReview,
  uploadReviewImages,
} from '../../api/reviewApi'

// 리뷰 등록과 수정을 담당하는 입력 폼이다.
// review가 있으면 수정, 없으면 신규 등록으로 동작한다.
function ReviewForm({
  reservationId,
  currentUserId,
  review,
  onSuccess,
  onCancel,
}) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isUpdate = Boolean(review?.reviewId)

  // 수정할 리뷰가 있으면 기존 별점과 내용을 표시한다.
  useEffect(() => {
    setRating(review?.rating ?? 5)
    setContent(review?.content ?? '')
    setFiles([])
  }, [review])

  // 사용자가 첨부한 이미지 파일을 저장한다.
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const existingImageCount = review?.images?.length ?? 0

    // 기존 이미지와 새 이미지를 합쳐 최대 5장까지만 허용한다.
    if (existingImageCount + selectedFiles.length > 5) {
      setError('리뷰 이미지는 최대 5장까지 등록할 수 있습니다.')
      setFiles([])
      event.target.value = ''
      return
    }

    setError('')
    setFiles(selectedFiles)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!currentUserId) {
      setError('로그인 후 리뷰를 작성할 수 있습니다.')
      return
    }

    if (rating < 1 || rating > 5) {
      setError('별점은 1점부터 5점까지 선택해야 합니다.')
      return
    }

    if (!content.trim()) {
      setError('리뷰 내용을 입력해야 합니다.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const requestData = {
        rating: Number(rating),
        content: content.trim(),
      }

      let response

      if (isUpdate) {
        response = await updateReview(
          review.reviewId,
          currentUserId,
          requestData,
        )
      } else {
        response = await createReview(
          currentUserId,
          {
            reservationId: Number(reservationId),
            ...requestData,
          },
        )
      }

      let savedReview = response.data

      // 리뷰가 저장된 후 생성된 reviewId를 이용하여 이미지를 등록한다.
      if (files.length > 0) {
        try {
          const imageResponse = await uploadReviewImages(
            savedReview.reviewId,
            currentUserId,
            files,
          )

          savedReview = {
            ...savedReview,
            images: [
              ...(savedReview.images ?? []),
              ...imageResponse.data,
            ],
          }
        } catch (imageError) {
          console.error('이미지 업로드 실패:', imageError)

          alert(
            '리뷰는 저장되었지만 이미지 업로드에 실패했습니다.',
          )
        }
      }

      setFiles([])
      onSuccess?.(savedReview)
    } catch (error) {
      console.error(error)

      const responseMessage = error.response?.data?.message

      setError(
        responseMessage || '리뷰 저장에 실패했습니다.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: 16 }}>{isUpdate ? '리뷰 수정' : '리뷰 작성'}</h3>

      <div className="field">
        <label className="field-label" htmlFor="review-rating">별점</label>

        <select
          id="review-rating"
          className="select"
          style={{ maxWidth: 120 }}
          value={rating}
          onChange={(event) =>
            setRating(Number(event.target.value))
          }
        >
          <option value={5}>5점</option>
          <option value={4}>4점</option>
          <option value={3}>3점</option>
          <option value={2}>2점</option>
          <option value={1}>1점</option>
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="review-content">리뷰 내용</label>

        <textarea
          id="review-content"
          className="textarea"
          value={content}
          rows={5}
          onChange={(event) =>
            setContent(event.target.value)
          }
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="review-images">
          리뷰 이미지
        </label>

        <input
          id="review-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {files.length > 0 && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--color-ink-soft)' }}>
            {files.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}>
                {file.name}
              </li>
            ))}
          </ul>
        )}

        <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 6 }}>
          이미지 {files.length}장 선택됨 / 최대 5장
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting
            ? '저장 중...'
            : isUpdate
              ? '수정 완료'
              : '리뷰 등록'}
        </button>

        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  )
}

export default ReviewForm