import { useCallback, useEffect, useState } from "react";
import { deleteReview, getShopReviews, toggleReviewLike } from "../../api/reviewAPI";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

// 정비소 상세 화면에 표시할 리뷰 목록 컴포넌트이다.
function ShopReviewSection({ shopId, currentUserId }) {
    const [reviewData, setReviewData] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 현재 정비소의 리뷰 목록을 조회한다.
    const loadReviews = useCallback(async () => {
        if (!shopId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getShopReviews(shopId, currentUserId, page, 5);

            setReviewData(response.data);
        } catch (error) {
            console.error(error);
            setError("리뷰를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [shopId, currentUserId, page]);

    // 정비소나 페이지가 변경되면 리뷰 목록을 다시 조회한다.
    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // 좋아요 처리 결과를 현재 화면에 바로 반영한다.
    const handleLike = async (reviewId) => {
        if (!currentUserId) {
            alert("로그인 후 좋아요를 누를 수 있습니다.");
            return;
        }

        try {
            const response = await toggleReviewLike(reviewId, currentUserId);

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
            }));
        } catch (error) {
            console.error(error);
            alert("좋아요 처리에 실패했습니다.");
        }
    };

    // 리뷰 수정이 완료되면 수정 폼을 닫고 목록을 다시 조회한다.
    const handleEditSuccess = async () => {
        setEditingReview(null);
        await loadReviews();
    };

    // 작성자 본인의 리뷰를 삭제한다.
    const handleDelete = async (reviewId) => {
        if (!currentUserId) {
            alert("로그인 후 이용할 수 있습니다.");
            return;
        }

        if (!window.confirm("리뷰를 삭제하시겠습니까?")) {
            return;
        }

        try {
            await deleteReview(reviewId, currentUserId);

            // 현재 페이지의 마지막 리뷰를 삭제했다면 이전 페이지로 이동한다.
            if (reviewData.reviews.length === 1 && page > 0) {
                setPage((previous) => previous - 1);
            } else {
                await loadReviews();
            }

            setEditingReview(null);
            alert("리뷰가 삭제되었습니다.");
        } catch (error) {
            console.error(error);

            const responseMessage = error.response?.data?.message;

            alert(responseMessage || "리뷰 삭제에 실패했습니다.");
        }
    };

    if (loading) {
        return <p style={{ fontSize: 14 }}>리뷰를 불러오는 중입니다.</p>;
    }

    if (error) {
        return <p className="form-error">{error}</p>;
    }

    if (!reviewData) {
        return null;
    }

    return (
        <section>
            <div className="section-title-row">
                <h2>방문자 리뷰</h2>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <strong style={{ fontFamily: "var(--font-mono)", fontSize: 20, color: "var(--color-signal-hover)" }}>
                        ★ {reviewData.averageRating?.toFixed(1) ?? "0.0"}
                    </strong>
                    <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                        리뷰 {reviewData.reviewCount}개
                    </span>
                </div>
            </div>

            {reviewData.reviews.length === 0 ? (
                <div className="empty-state">아직 작성된 리뷰가 없습니다.</div>
            ) : (
                <div>
                    {reviewData.reviews.map((review) => (
                        <div key={review.reviewId}>
                            {editingReview?.reviewId === review.reviewId ? (
                                <ReviewForm
                                    currentUserId={currentUserId}
                                    review={editingReview}
                                    onSuccess={handleEditSuccess}
                                    onCancel={() => setEditingReview(null)}
                                />
                            ) : (
                                <ReviewCard
                                    review={review}
                                    currentUserId={currentUserId}
                                    onLike={handleLike}
                                    onEdit={setEditingReview}
                                    onDelete={handleDelete}
                                />
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
                    onClick={() => setPage((previous) => previous - 1)}
                >
                    이전
                </button>

                <span>
                    {reviewData.totalPages === 0 ? 0 : reviewData.currentPage + 1}
                    /{reviewData.totalPages}
                </span>

                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={page + 1 >= reviewData.totalPages}
                    onClick={() => setPage((previous) => previous + 1)}
                >
                    다음
                </button>
            </div>
        </section>
    );
}

export default ShopReviewSection;
