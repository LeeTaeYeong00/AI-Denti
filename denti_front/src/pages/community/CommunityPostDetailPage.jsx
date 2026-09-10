import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    addCommunityPostLike,
    deleteCommunityPost,
    getCommunityPost,
    removeCommunityPostLike,
} from "../../api/communityApi";
import { SERVER_BASE_URL } from "../../api/config";
import CommunityAuthor from "../../components/community/CommunityAuthor";
import CommunityCommentSection from "../../components/community/CommunityCommentSection";
import { HeartIcon } from "../../components/icons";
import { useAuth } from "../../context/AuthContext";

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

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${SERVER_BASE_URL ?? ""}${imageUrl}`;
};

function CommunityPostDetailPage() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { loginUser } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [liking, setLiking] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    // StrictMode의 개발용 Effect 재실행 때 동일한 상세 요청을 재사용한다.
    const detailRequestRef = useRef({
        key: "",
        promise: null,
    });

    useEffect(() => {
        let active = true;
        const requestKey = `${postId}:${reloadKey}`;

        if (detailRequestRef.current.key !== requestKey) {
            detailRequestRef.current = {
                key: requestKey,
                promise: getCommunityPost(postId),
            };
        }

        const request = detailRequestRef.current.promise;

        const loadPost = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const data = await request;

                if (!active) {
                    return;
                }

                setPost(data);
            } catch (requestError) {
                if (!active) {
                    return;
                }

                console.error(
                    "자유게시판 상세 조회 실패:",
                    requestError
                );

                setPost(null);
                setLoadError(
                    getErrorMessage(
                        requestError,
                        "게시글을 불러오지 못했습니다."
                    )
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            active = false;
        };
    }, [postId, reloadKey]);

    const isWriter =
        loginUser?.userId != null &&
        post?.writerId != null &&
        String(loginUser.userId) === String(post.writerId);

    const handleLike = async () => {
        if (!loginUser) {
            navigate("/login");
            return;
        }

        if (!post || liking) {
            return;
        }

        const wasLiked = Boolean(post.liked);

        try {
            setLiking(true);
            setActionError("");

            const data = wasLiked
                ? await removeCommunityPostLike(post.postId)
                : await addCommunityPostLike(post.postId);

            setPost((currentPost) => {
                if (!currentPost) {
                    return currentPost;
                }

                return {
                    ...currentPost,
                    liked: data.liked ?? !wasLiked,
                    likeCount:
                        data.likeCount ??
                        currentPost.likeCount ??
                        0,
                };
            });
        } catch (requestError) {
            console.error(
                "게시글 좋아요 처리 실패:",
                requestError
            );

            setActionError(
                getErrorMessage(
                    requestError,
                    "좋아요를 처리하지 못했습니다."
                )
            );
        } finally {
            setLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!post || deleting || !isWriter) {
            return;
        }

        if (!window.confirm("이 게시글을 삭제하시겠습니까?")) {
            return;
        }

        try {
            setDeleting(true);
            setActionError("");

            await deleteCommunityPost(post.postId);

            navigate("/community", {
                replace: true,
            });
        } catch (requestError) {
            console.error(
                "게시글 삭제 실패:",
                requestError
            );

            setActionError(
                getErrorMessage(
                    requestError,
                    "게시글을 삭제하지 못했습니다."
                )
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleCommentCountChange = useCallback(
        (nextCommentCount) => {
            setPost((currentPost) => {
                if (
                    !currentPost ||
                    currentPost.commentCount === nextCommentCount
                ) {
                    return currentPost;
                }

                return {
                    ...currentPost,
                    commentCount: nextCommentCount,
                };
            });
        },
        []
    );

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    게시글을 불러오는 중입니다.
                </div>
            </div>
        );
    }

    if (loadError || !post) {
        return (
            <div className="page">
                <div className="empty-state">
                    <p>
                        {loadError ||
                            "게시글을 찾을 수 없습니다."}
                    </p>

                    <div className="community-detail-error-actions">
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                                navigate("/community")
                            }
                        >
                            목록으로
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                                setReloadKey(
                                    (current) => current + 1
                                )
                            }
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="community-detail-top">
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/community")}
                >
                    목록으로
                </button>

                {isWriter && (
                    <div className="community-detail-top__actions">
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                                navigate(
                                    `/community/${post.postId}/edit`
                                )
                            }
                            disabled={deleting}
                        >
                            수정
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "삭제 중..."
                                : "삭제"}
                        </button>
                    </div>
                )}
            </div>

            <article className="card community-detail">
                <header className="community-detail__header">
                    <span className="eyebrow">
                        COMMUNITY
                    </span>

                    <h1>{post.title}</h1>

                    <div className="community-detail__author-row">
                        <CommunityAuthor
                            nickname={post.writerNickname}
                            writerShops={post.writerShops}
                        />

                        <time dateTime={post.createdAt}>
                            {formatDateTime(post.createdAt)}
                        </time>
                    </div>

                    <div className="community-detail__meta">
                        <span>
                            조회 {post.viewCount ?? 0}
                        </span>

                        <span>
                            좋아요 {post.likeCount ?? 0}
                        </span>

                        <span>
                            댓글 {post.commentCount ?? 0}
                        </span>

                        {post.updatedAt && (
                            <span>
                                수정{" "}
                                {formatDateTime(
                                    post.updatedAt
                                )}
                            </span>
                        )}
                    </div>
                </header>

                {(post.images ?? []).length > 0 && (
                    <div className="community-detail-images">
                        {post.images.map((image) => (
                            <a
                                key={image.postImageId}
                                href={getImageUrl(
                                    image.imageUrl
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="community-detail-images__item"
                            >
                                <img
                                    src={getImageUrl(
                                        image.imageUrl
                                    )}
                                    alt={
                                        image.originalName ||
                                        `${post.title} 첨부 이미지`
                                    }
                                />
                            </a>
                        ))}
                    </div>
                )}

                <div className="community-detail__content">
                    {post.content}
                </div>

                <footer className="community-detail__footer">
                    <button
                        type="button"
                        className={`community-like-button ${
                            post.liked
                                ? "community-like-button--active"
                                : ""
                        }`}
                        onClick={handleLike}
                        disabled={liking}
                        aria-pressed={Boolean(post.liked)}
                    >
                        <HeartIcon
                            width="18"
                            height="18"
                            fill={
                                post.liked
                                    ? "currentColor"
                                    : "none"
                            }
                        />

                        <span>
                            {liking
                                ? "처리 중..."
                                : post.liked
                                  ? "좋아요 취소"
                                  : "좋아요"}
                        </span>

                        <strong>
                            {post.likeCount ?? 0}
                        </strong>
                    </button>
                </footer>

                {actionError && (
                    <p className="form-error community-detail__error">
                        {actionError}
                    </p>
                )}
            </article>

            <div className="card community-comments-card">
                <CommunityCommentSection
                    postId={post.postId}
                    initialCommentCount={
                        post.commentCount ?? 0
                    }
                    onCommentCountChange={
                        handleCommentCountChange
                    }
                />
            </div>
        </div>
    );
}

export default CommunityPostDetailPage;