import { SERVER_BASE_URL } from "../../api/config";

// 리뷰 목록에서 리뷰 한 건을 표시하는 컴포넌트이다.
function ReviewCard({ review, currentUserId, onLike, onEdit, onDelete }) {
    const isWriter =
        currentUserId && Number(currentUserId) === Number(review.writerId);

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString("ko-KR");
    };

    return (
        <article className="review-card">
            <div className="review-card__head">
                <span className="review-card__author">{review.writerNickname}</span>
                <span className="review-card__date">{formatDate(review.createdAt)}</span>
            </div>

            <div className="review-card__stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
            </div>

            <p className="review-card__content">{review.content}</p>

            {review.images?.length > 0 && (
                <div className="review-card__images">
                    {review.images.map((image) => (
                        <img
                            key={image.reviewImageId}
                            src={`${SERVER_BASE_URL}${image.imageUrl}`}
                            alt={image.originalName}
                        />
                    ))}
                </div>
            )}

            <div className="review-card__actions">
                <button
                    type="button"
                    className={`like-btn ${review.liked ? "like-btn--liked" : ""}`}
                    onClick={() => onLike(review.reviewId)}
                >
                    {review.liked ? "♥" : "♡"} {review.likeCount}
                </button>

                {/* 현재 로그인 사용자가 작성자인 경우에만 표시한다. */}
                {isWriter && (
                    <>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(review)}>
                            수정
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(review.reviewId)}>
                            삭제
                        </button>
                    </>
                )}
            </div>

            {review.reply && (
                <div className="review-reply">
                    <strong>정비소 답변</strong>
                    <p style={{ margin: "4px 0", color: "var(--color-ink)" }}>{review.reply.content}</p>
                    <span style={{ color: "var(--color-ink-faint)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {formatDate(review.reply.createdAt)}
                    </span>
                </div>
            )}
        </article>
    );
}

export default ReviewCard;
