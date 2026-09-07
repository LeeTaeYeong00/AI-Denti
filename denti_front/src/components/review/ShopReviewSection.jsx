import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    addReviewLike,
    deleteReview,
    deleteReviewReply,
    getShopReviews,
    removeReviewLike,
} from "../../api/reviewApi";

import { useAuth } from "../../context/AuthContext";

import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import ReviewReplyForm from "./ReviewReplyForm";

// 정비소 상세 화면에 표시할 리뷰 목록 컴포넌트이다.
function ShopReviewSection({
    shopId,
    replyManagement = false,
}) {
    const { loginUser } = useAuth();

    // 화면에서 리뷰 작성자 여부를 확인할 때만 사용한다.
    // 백엔드 API에는 전달하지 않는다.
    const currentUserId =
        loginUser?.userId;

    const [reviewData, setReviewData] =
        useState(null);

    const [editingReview, setEditingReview] =
        useState(null);

    const [
        editingReplyReviewId,
        setEditingReplyReviewId,
    ] = useState(null);

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

            const response =
                await getShopReviews(
                    shopId,
                    page,
                    5
                );

            setReviewData(response.data);
        } catch (error) {
            console.error(error);

            setError(
                "리뷰를 불러오지 못했습니다."
            );
        } finally {
            setLoading(false);
        }
    }, [shopId, page, currentUserId]);

    // 정비소, 페이지 또는 로그인 사용자가 변경되면
    // 좋아요 상태를 포함한 리뷰 목록을 다시 조회한다.
    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // 현재 좋아요 상태에 따라 등록 또는 취소 요청을 보낸다.
    const handleLike = async (reviewId) => {
        if (!loginUser) {
            alert(
                "로그인 후 좋아요를 누를 수 있습니다."
            );

            return;
        }

        const currentReview =
            reviewData?.reviews?.find(
                (review) =>
                    review.reviewId === reviewId
            );

        if (!currentReview) {
            alert(
                "리뷰 정보를 찾을 수 없습니다."
            );
            return;
        }

        try {
            const response =
                currentReview.liked
                    ? await removeReviewLike(
                          reviewId
                      )
                    : await addReviewLike(
                          reviewId
                      );

            setReviewData((previous) => ({
                ...previous,

                reviews: previous.reviews.map(
                    (review) =>
                        review.reviewId === reviewId
                            ? {
                                  ...review,
                                  liked:
                                      response.data
                                          .liked,
                                  likeCount:
                                      response.data
                                          .likeCount,
                              }
                            : review
                ),
            }));
        } catch (error) {
            console.error(error);

            const responseMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : error.response?.data
                          ?.message;

            alert(
                responseMessage ||
                    "좋아요 처리에 실패했습니다."
            );
        }
    };

    // 리뷰 수정이 완료되면 수정 폼을 닫고 목록을 다시 조회한다.
    const handleEditSuccess = async () => {
        setEditingReview(null);
        await loadReviews();
    };

    // 정비소 답변 등록 또는 수정이 완료되면
    // 수정 폼을 닫고 리뷰 목록을 다시 조회한다.
    const handleReplySuccess = async () => {
        setEditingReplyReviewId(null);
        await loadReviews();
    };

    // 정비소가 작성한 공식 답변을 삭제한다.
    const handleReplyDelete = async (
        reviewId
    ) => {
        if (
            !window.confirm(
                "정비소 답변을 삭제하시겠습니까?"
            )
        ) {
            return;
        }

        try {
            await deleteReviewReply(reviewId);

            setEditingReplyReviewId(null);
            await loadReviews();

            alert(
                "정비소 답변이 삭제되었습니다."
            );
        } catch (error) {
            console.error(
                "정비소 답변 삭제 실패:",
                error
            );

            const responseMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : error.response?.data
                          ?.message;

            alert(
                responseMessage ||
                    "정비소 답변 삭제에 실패했습니다."
            );
        }
    };

    // 작성자 본인의 리뷰를 삭제한다.
    const handleDelete = async (reviewId) => {
        if (!loginUser) {
            alert(
                "로그인 후 이용할 수 있습니다."
            );

            return;
        }

        if (
            !window.confirm(
                "리뷰를 삭제하시겠습니까?"
            )
        ) {
            return;
        }

        try {
            await deleteReview(reviewId);

            // 현재 페이지의 마지막 리뷰를 삭제했다면 이전 페이지로 이동한다.
            if (
                reviewData.reviews.length === 1 &&
                page > 0
            ) {
                setPage(
                    (previous) => previous - 1
                );
            } else {
                await loadReviews();
            }

            setEditingReview(null);

            alert(
                "리뷰가 삭제되었습니다."
            );
        } catch (error) {
            console.error(error);

            const responseMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : error.response?.data
                          ?.message;

            alert(
                responseMessage ||
                    "리뷰 삭제에 실패했습니다."
            );
        }
    };

    if (loading) {
        return (
            <p style={{ fontSize: 14 }}>
                리뷰를 불러오는 중입니다.
            </p>
        );
    }

    if (error) {
        return (
            <p className="form-error">
                {error}
            </p>
        );
    }

    if (!reviewData) {
        return null;
    }

    return (
        <section>
            <div className="section-title-row">
                <h2>방문자 리뷰</h2>

                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                    }}
                >
                    <strong
                        style={{
                            fontFamily:
                                "var(--font-mono)",
                            fontSize: 20,
                            color:
                                "var(--color-signal-hover)",
                        }}
                    >
                        ★{" "}
                        {reviewData.averageRating?.toFixed(
                            1
                        ) ?? "0.0"}
                    </strong>

                    <span
                        style={{
                            fontSize: 13,
                            color:
                                "var(--color-ink-soft)",
                        }}
                    >
                        리뷰{" "}
                        {reviewData.reviewCount}개
                    </span>
                </div>
            </div>

            {reviewData.reviews.length === 0 ? (
                <div className="empty-state">
                    아직 작성된 리뷰가 없습니다.
                </div>
            ) : (
                <div>
                    {reviewData.reviews.map(
                        (review) => (
                            <div
                                key={
                                    review.reviewId
                                }
                            >
                                {editingReview?.reviewId ===
                                review.reviewId ? (
                                    <ReviewForm
                                        review={
                                            editingReview
                                        }
                                        onSuccess={
                                            handleEditSuccess
                                        }
                                        onCancel={() =>
                                            setEditingReview(
                                                null
                                            )
                                        }
                                    />
                                ) : (
                                    <>
                                        <ReviewCard
                                            review={
                                                review
                                            }
                                            currentUserId={
                                                currentUserId
                                            }
                                            onLike={
                                                handleLike
                                            }
                                            onEdit={
                                                setEditingReview
                                            }
                                            onDelete={
                                                handleDelete
                                            }
                                        />

                                        {replyManagement && (
                                            <div
                                                style={{
                                                    marginBottom: 20,
                                                }}
                                            >
                                                {review.reply ? (
                                                    editingReplyReviewId ===
                                                    review.reviewId ? (
                                                        <ReviewReplyForm
                                                            reviewId={
                                                                review.reviewId
                                                            }
                                                            reply={
                                                                review.reply
                                                            }
                                                            onSuccess={
                                                                handleReplySuccess
                                                            }
                                                            onCancel={() =>
                                                                setEditingReplyReviewId(
                                                                    null
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "flex-end",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() =>
                                                                    setEditingReplyReviewId(
                                                                        review.reviewId
                                                                    )
                                                                }
                                                            >
                                                                답변 수정
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() =>
                                                                    handleReplyDelete(
                                                                        review.reviewId
                                                                    )
                                                                }
                                                            >
                                                                답변 삭제
                                                            </button>
                                                        </div>
                                                    )
                                                ) : (
                                                    <ReviewReplyForm
                                                        reviewId={
                                                            review.reviewId
                                                        }
                                                        onSuccess={
                                                            handleReplySuccess
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            <div className="pager">
                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={page === 0}
                    onClick={() =>
                        setPage(
                            (previous) =>
                                previous - 1
                        )
                    }
                >
                    이전
                </button>

                <span>
                    {reviewData.totalPages === 0
                        ? 0
                        : reviewData.currentPage +
                          1}
                    /{reviewData.totalPages}
                </span>

                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={
                        page + 1 >=
                        reviewData.totalPages
                    }
                    onClick={() =>
                        setPage(
                            (previous) =>
                                previous + 1
                        )
                    }
                >
                    다음
                </button>
            </div>
        </section>
    );
}

export default ShopReviewSection;