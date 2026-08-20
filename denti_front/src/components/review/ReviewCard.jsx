// 리뷰 목록에서 리뷰 한 건을 표시하는 컴포넌트이다.
function ReviewCard({
  review,
  currentUserId,
  onLike,
  onEdit,
  onDelete,
}) {
  const isWriter =
    currentUserId &&
    Number(currentUserId) === Number(review.writerId)

  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(date).toLocaleDateString('ko-KR')
  }

  return (
    <article>
      <div>
        <strong>{review.writerNickname}</strong>
        <span>{formatDate(review.createdAt)}</span>
      </div>

      <div>
        {'★'.repeat(review.rating)}
        {'☆'.repeat(5 - review.rating)}
      </div>

      <p>{review.content}</p>

      {review.images?.length > 0 && (
        <div>
          {review.images.map((image) => (
            <img
              key={image.reviewImageId}
              src={`http://localhost:8080${image.imageUrl}`}
              alt={image.originalName}
              width="120"
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onLike(review.reviewId)}
      >
        {review.liked ? '♥' : '♡'} 좋아요 {review.likeCount}
      </button>

      {/* 현재 로그인 사용자가 작성자인 경우에만 표시한다. */}
      {isWriter && (
        <div>
          <button
            type="button"
            onClick={() => onEdit(review)}
          >
            수정
          </button>

          <button
            type="button"
            onClick={() => onDelete(review.reviewId)}
          >
            삭제
          </button>
        </div>
      )}

      {review.reply && (
        <div>
          <strong>정비소 답변</strong>
          <p>{review.reply.content}</p>
          <span>{formatDate(review.reply.createdAt)}</span>
        </div>
      )}
    </article>
  )
}

export default ReviewCard