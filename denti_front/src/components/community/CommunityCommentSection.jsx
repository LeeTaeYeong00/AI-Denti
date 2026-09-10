import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    createCommunityComment,
    deleteCommunityComment,
    getCommunityComments,
    updateCommunityComment,
} from "../../api/communityApi";
import { useAuth } from "../../context/AuthContext";
import CommunityAuthor from "./CommunityAuthor";

const COMMENT_PAGE_SIZE = 20;
const MAX_COMMENT_LENGTH = 1000;

const getErrorMessage = (error, fallbackMessage) => {
    const responseData = error?.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    return fallbackMessage;
};

const formatDateTime = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

function CommunityCommentSection({
    postId,
    initialCommentCount = 0,
    onCommentCountChange,
}) {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(
        initialCommentCount
    );
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [newContent, setNewContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updatingCommentId, setUpdatingCommentId] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [error, setError] = useState("");

    const applyCommentData = useCallback(
        (data) => {
            const nextCommentCount = data.commentCount ?? 0;

            setComments(data.comments ?? []);
            setCommentCount(nextCommentCount);
            setTotalPages(data.totalPages ?? 0);

            if (onCommentCountChange) {
                onCommentCountChange(nextCommentCount);
            }
        },
        [onCommentCountChange]
    );

    const loadComments = useCallback(
        async (targetPage, showLoading = true) => {
            try {
                if (showLoading) {
                    setLoading(true);
                }

                setError("");

                const data = await getCommunityComments(
                    postId,
                    targetPage,
                    COMMENT_PAGE_SIZE
                );

                applyCommentData(data);
            } catch (requestError) {
                console.error("댓글 목록 조회 실패:", requestError);

                setError(
                    getErrorMessage(
                        requestError,
                        "댓글을 불러오지 못했습니다."
                    )
                );
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        [applyCommentData, postId]
    );

    useEffect(() => {
        loadComments(page);
    }, [loadComments, page]);

    const isMyComment = (comment) =>
        loginUser?.userId != null &&
        String(loginUser.userId) === String(comment.writerId);

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!loginUser) {
            navigate("/login");
            return;
        }

        const normalizedContent = newContent.trim();

        if (!normalizedContent) {
            setError("댓글 내용을 입력해주세요.");
            return;
        }

        if (normalizedContent.length > MAX_COMMENT_LENGTH) {
            setError("댓글은 1000자 이하로 작성해주세요.");
            return;
        }

        try {
            setCreating(true);
            setError("");

            await createCommunityComment(postId, {
                content: normalizedContent,
            });

            setNewContent("");

            const nextCommentCount = commentCount + 1;
            const lastPage = Math.max(
                Math.ceil(nextCommentCount / COMMENT_PAGE_SIZE) - 1,
                0
            );

            if (lastPage !== page) {
                setPage(lastPage);
            } else {
                await loadComments(page, false);
            }
        } catch (requestError) {
            console.error("댓글 등록 실패:", requestError);

            setError(
                getErrorMessage(
                    requestError,
                    "댓글을 등록하지 못했습니다."
                )
            );
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (comment) => {
        setEditingCommentId(comment.commentId);
        setEditContent(comment.content ?? "");
        setError("");
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleUpdate = async (commentId) => {
        const normalizedContent = editContent.trim();

        if (!normalizedContent) {
            setError("댓글 내용을 입력해주세요.");
            return;
        }

        if (normalizedContent.length > MAX_COMMENT_LENGTH) {
            setError("댓글은 1000자 이하로 작성해주세요.");
            return;
        }

        try {
            setUpdatingCommentId(commentId);
            setError("");

            await updateCommunityComment(commentId, {
                content: normalizedContent,
            });

            cancelEdit();
            await loadComments(page, false);
        } catch (requestError) {
            console.error("댓글 수정 실패:", requestError);

            setError(
                getErrorMessage(
                    requestError,
                    "댓글을 수정하지 못했습니다."
                )
            );
        } finally {
            setUpdatingCommentId(null);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("이 댓글을 삭제하시겠습니까?")) {
            return;
        }

        try {
            setDeletingCommentId(commentId);
            setError("");

            await deleteCommunityComment(commentId);

            const nextCommentCount = Math.max(commentCount - 1, 0);
            const lastPage = Math.max(
                Math.ceil(nextCommentCount / COMMENT_PAGE_SIZE) - 1,
                0
            );

            if (page > lastPage) {
                setPage(lastPage);
            } else {
                await loadComments(page, false);
            }
        } catch (requestError) {
            console.error("댓글 삭제 실패:", requestError);

            setError(
                getErrorMessage(
                    requestError,
                    "댓글을 삭제하지 못했습니다."
                )
            );
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <section className="community-comments">
            <div className="community-comments__heading">
                <h2>댓글</h2>
                <span>{commentCount.toLocaleString()}개</span>
            </div>

            {loginUser ? (
                <form
                    className="community-comment-form"
                    onSubmit={handleCreate}
                >
                    <textarea
                        className="textarea"
                        value={newContent}
                        onChange={(event) =>
                            setNewContent(event.target.value)
                        }
                        maxLength={MAX_COMMENT_LENGTH}
                        placeholder="댓글을 입력하세요"
                        disabled={creating}
                    />

                    <div className="community-comment-form__foot">
                        <span>
                            {newContent.length} / {MAX_COMMENT_LENGTH}
                        </span>

                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={creating}
                        >
                            {creating ? "등록 중..." : "댓글 등록"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="community-comment-login">
                    <span>
                        댓글을 작성하려면 로그인이 필요합니다.
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate("/login")}
                    >
                        로그인
                    </button>
                </div>
            )}

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="empty-state">
                    댓글을 불러오는 중입니다.
                </div>
            ) : comments.length === 0 ? (
                <div className="empty-state">
                    첫 번째 댓글을 작성해보세요.
                </div>
            ) : (
                <div className="community-comment-list">
                    {comments.map((comment) => {
                        const editing =
                            editingCommentId === comment.commentId;

                        return (
                            <article
                                key={comment.commentId}
                                className="community-comment"
                            >
                                <div className="community-comment__head">
                                    <CommunityAuthor
                                        nickname={comment.writerNickname}
                                        writerShops={comment.writerShops}
                                    />

                                    <time>
                                        {formatDateTime(
                                            comment.updatedAt ??
                                                comment.createdAt
                                        )}
                                    </time>
                                </div>

                                {editing ? (
                                    <div className="community-comment-edit">
                                        <textarea
                                            className="textarea"
                                            value={editContent}
                                            onChange={(event) =>
                                                setEditContent(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={MAX_COMMENT_LENGTH}
                                            disabled={
                                                updatingCommentId ===
                                                comment.commentId
                                            }
                                        />

                                        <div className="community-comment-edit__foot">
                                            <span>
                                                {editContent.length} /{" "}
                                                {MAX_COMMENT_LENGTH}
                                            </span>

                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={cancelEdit}
                                                    disabled={
                                                        updatingCommentId ===
                                                        comment.commentId
                                                    }
                                                >
                                                    취소
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        handleUpdate(
                                                            comment.commentId
                                                        )
                                                    }
                                                    disabled={
                                                        updatingCommentId ===
                                                        comment.commentId
                                                    }
                                                >
                                                    {updatingCommentId ===
                                                    comment.commentId
                                                        ? "저장 중..."
                                                        : "저장"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="community-comment__content">
                                        {comment.content}
                                    </p>
                                )}

                                {!editing && isMyComment(comment) && (
                                    <div className="community-comment__actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEdit(comment)
                                            }
                                            disabled={
                                                deletingCommentId != null
                                            }
                                        >
                                            수정
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    comment.commentId
                                                )
                                            }
                                            disabled={
                                                deletingCommentId != null
                                            }
                                        >
                                            {deletingCommentId ===
                                            comment.commentId
                                                ? "삭제 중..."
                                                : "삭제"}
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="community-comment-pagination">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                            setPage((current) => current - 1)
                        }
                        disabled={page === 0 || loading}
                    >
                        이전
                    </button>

                    <span>
                        {page + 1} / {totalPages}
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                            setPage((current) => current + 1)
                        }
                        disabled={
                            page >= totalPages - 1 || loading
                        }
                    >
                        다음
                    </button>
                </div>
            )}
        </section>
    );
}

export default CommunityCommentSection;