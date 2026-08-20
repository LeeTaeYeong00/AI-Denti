// 리뷰 목록에서 리뷰 한 건을 표시하는 컴포넌트이다.
function ReviewCard({ review, onLike }) {
  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(date).toLocaleDateString('ko-KR')
  }

  return (
    <article className="review-card">
      <div className="review-card-header">
        <strong>{review.writerNickname}</strong>
        <span>{formatDate(review.createdAt)}</span>
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
        className={`review-like-button ${
          review.liked ? 'liked' : ''
        }`}
        onClick={() => onLike(review.reviewId)}
      >
        {review.liked ? '♥' : '♡'} 좋아요 {review.likeCount}
      </button>

      {review.reply && (
        <div className="review-reply">
          <strong>정비소 답변</strong>
          <p>{review.reply.content}</p>
          <span>{formatDate(review.reply.createdAt)}</span>
        </div>
      )}
    </article>
  )
}

export default ReviewCard