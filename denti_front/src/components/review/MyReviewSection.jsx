import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteReview,
  getMyReviews,
  toggleReviewLike,
} from '../../api/reviewApi'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

// 마이페이지에서 현재 사용자가 작성한 리뷰를 관리하는 컴포넌트이다.
function MyReviewSection({ currentUserId }) {
  const navigate = useNavigate()

  const [reviewData, setReviewData] = useState(null)
  const [editingReview, setEditingReview] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 현재 사용자가 작성한 리뷰 목록을 조회한다.
  const loadReviews = useCallback(async () => {
    if (!currentUserId) {
      setReviewData(null)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await getMyReviews(
        currentUserId,
        page,
        5,
      )

      setReviewData(response.data)
    } catch (error) {
      console.error(error)
      setError('내 리뷰를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, page])

  // 로그인 사용자나 페이지가 변경되면 리뷰를 다시 조회한다.
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // 리뷰 좋아요를 등록하거나 취소한다.
  const handleLike = async (reviewId) => {
    if (!currentUserId) {
      alert('로그인 후 좋아요를 누를 수 있습니다.')
      return
    }

    try {
      const response = await toggleReviewLike(
        reviewId,
        currentUserId,
      )

      setReviewData((previous) => ({
        ...previous,
        reviews: previous.reviews.map((review) =>
          review.reviewId === reviewId
            ? {
                ...review,
                liked: response.data.liked,
                likeCount: response.data.likeCount,
              }
            : review,
        ),
      }))
    } catch (error) {
      console.error(error)
      alert('좋아요 처리에 실패했습니다.')
    }
  }

  // 리뷰 수정이 완료되면 수정 폼을 닫고 목록을 다시 조회한다.
  const handleEditSuccess = async () => {
    setEditingReview(null)
    await loadReviews()
  }

  // 현재 사용자가 작성한 리뷰를 삭제한다.
  const handleDelete = async (reviewId) => {
    if (!currentUserId) {
      alert('로그인 후 이용할 수 있습니다.')
      return
    }

    if (!window.confirm('리뷰를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteReview(
        reviewId,
        currentUserId,
      )

      // 현재 페이지의 마지막 리뷰를 삭제했다면 이전 페이지로 이동한다.
      if (
        reviewData.reviews.length === 1 &&
        page > 0
      ) {
        setPage((previous) => previous - 1)
      } else {
        await loadReviews()
      }

      setEditingReview(null)
      alert('리뷰가 삭제되었습니다.')
    } catch (error) {
      console.error(error)

      const responseMessage =
        error.response?.data?.message

      alert(
        responseMessage ||
          '리뷰 삭제에 실패했습니다.',
      )
    }
  }

  if (!currentUserId) {
    return <p style={{ fontSize: 14 }}>로그인 후 내 리뷰를 확인할 수 있습니다.</p>
  }

  if (loading) {
    return <p style={{ fontSize: 14 }}>내 리뷰를 불러오는 중입니다.</p>
  }

  if (error) {
    return <p className="form-error">{error}</p>
  }

  if (!reviewData) {
    return null
  }

  return (
    <section>
      <div className="section-title-row">
        <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
          총 {reviewData.reviewCount}개
        </span>
      </div>

      {reviewData.reviews.length === 0 ? (
        <div className="empty-state">아직 작성한 리뷰가 없습니다.</div>
      ) : (
        <div>
          {reviewData.reviews.map((review) => (
            <div key={review.reviewId}>
              {editingReview?.reviewId ===
              review.reviewId ? (
                <ReviewForm
                  currentUserId={currentUserId}
                  review={editingReview}
                  onSuccess={handleEditSuccess}
                  onCancel={() =>
                    setEditingReview(null)
                  }
                />
              ) : (
                <>
                  <ReviewCard
                    review={review}
                    currentUserId={currentUserId}
                    onLike={handleLike}
                    onEdit={setEditingReview}
                    onDelete={handleDelete}
                  />

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: -8, marginBottom: 8 }}
                    onClick={() =>
                      navigate(
                        `/repair-shops/${review.shopId}`,
                      )
                    }
                  >
                    {review.shopName} 상세보기 →
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pager">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page === 0}
          onClick={() =>
            setPage((previous) => previous - 1)
          }
        >
          이전
        </button>

        <span>
          {reviewData.totalPages === 0
            ? 0
            : reviewData.currentPage + 1}
          /{reviewData.totalPages}
        </span>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={
            page + 1 >= reviewData.totalPages
          }
          onClick={() =>
            setPage((previous) => previous + 1)
          }
        >
          다음
        </button>
      </div>
    </section>
  )
}

export default MyReviewSection