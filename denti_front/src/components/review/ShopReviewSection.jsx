import { useEffect, useState } from 'react'
import {
  getShopReviews,
  toggleReviewLike,
} from '../../api/reviewApi'

// 정비소 상세 화면에 표시할 리뷰 목록 컴포넌트이다.
function ShopReviewSection({ shopId, currentUserId }) {
  const [reviewData, setReviewData] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 정비소가 변경되거나 페이지가 바뀌면 리뷰를 다시 조회한다.
  useEffect(() => {
    if (!shopId) {
      return
    }

    const loadReviews = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getShopReviews(
          shopId,
          currentUserId,
          page,
          5,
        )

        setReviewData(response.data)
      } catch (error) {
        console.error(error)
        setError('리뷰를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [shopId, currentUserId, page])

  // 좋아요 처리 결과를 현재 화면에 바로 반영한다.
  const handleLike = async (reviewId) => {
    // 로그인하지 않은 경우 좋아요 요청을 보내지 않는다.
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

  if (loading) {
    return <p>리뷰를 불러오는 중입니다.</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!reviewData) {
    return null
  }

  return (
    <section className="shop-review-section">
      <div className="review-summary">
        <h2>방문자 리뷰</h2>

        <strong>
          ★ {reviewData.averageRating?.toFixed(1) ?? '0.0'}
        </strong>

        <span>리뷰 {reviewData.reviewCount}개</span>
      </div>

      {reviewData.reviews.length === 0 ? (
        <p className="empty-review">
          아직 작성된 리뷰가 없습니다.
        </p>
      ) : (
        <div className="review-list">
          {reviewData.reviews.map((review) => (
            <article
              key={review.reviewId}
              className="review-card"
            >
              <div className="review-card-header">
                <strong>{review.writerNickname}</strong>

                <span>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="review-rating">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>

              <p className="review-content">
                {review.content}
              </p>

              {review.images?.length > 0 && (
                <div className="review-images">
                  {review.images.map((image) => (
                    <img
                      key={image.reviewImageId}
                      src={`http://localhost:8080${image.imageUrl}`}
                      alt={image.originalName}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleLike(review.reviewId)}
              >
                {review.liked ? '♥' : '♡'} 좋아요{' '}
                {review.likeCount}
              </button>

              {review.reply && (
                <div className="review-reply">
                  <strong>정비소 답변</strong>
                  <p>{review.reply.content}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="review-pagination">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((previous) => previous - 1)}
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
          disabled={
            page + 1 >= reviewData.totalPages
          }
          onClick={() => setPage((previous) => previous + 1)}
        >
          다음
        </button>
      </div>
    </section>
  )
}

export default ShopReviewSection