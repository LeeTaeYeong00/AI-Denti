import {
    useEffect,
    useState,
} from "react";

import {
    createReviewReply,
    updateReviewReply,
} from "../../api/reviewApi";

// 정비소 공식 답변을 등록하거나 수정하는 폼이다.
function ReviewReplyForm({
    reviewId,
    reply,
    onSuccess,
    onCancel,
}) {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] =
        useState(false);
    const [error, setError] = useState("");

    // 수정할 답변이 있으면 기존 내용을 입력란에 표시한다.
    useEffect(() => {
        setContent(reply?.content ?? "");
        setError("");
    }, [reply]);

    // 기존 답변 존재 여부에 따라 등록 또는 수정 요청을 보낸다.
    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            setError("답변 내용을 입력해주세요.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const data = {
                content: trimmedContent,
            };

            const response = reply
                ? await updateReviewReply(
                      reviewId,
                      data
                  )
                : await createReviewReply(
                      reviewId,
                      data
                  );

            onSuccess(response.data);
        } catch (error) {
            console.error(
                "정비소 답변 처리 실패:",
                error
            );

            const responseMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : error.response?.data
                          ?.message;

            setError(
                responseMessage ||
                    "정비소 답변 처리에 실패했습니다."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                marginTop: 16,
                padding: 16,
                borderRadius: "var(--radius-sm)",
                background:
                    "var(--color-surface)",
            }}
        >
            <label
                className="field-label"
                htmlFor={`review-reply-${reviewId}`}
            >
                정비소 공식 답변
            </label>

            <textarea
                id={`review-reply-${reviewId}`}
                className="textarea"
                rows={4}
                value={content}
                disabled={submitting}
                placeholder="고객 리뷰에 대한 답변을 입력해주세요."
                onChange={(event) =>
                    setContent(event.target.value)
                }
            />

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 12,
                }}
            >
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={submitting}
                        onClick={onCancel}
                    >
                        취소
                    </button>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={
                        submitting ||
                        !content.trim()
                    }
                >
                    {submitting
                        ? "처리 중..."
                        : reply
                          ? "답변 수정 완료"
                          : "답변 등록"}
                </button>
            </div>
        </form>
    );
}

export default ReviewReplyForm;