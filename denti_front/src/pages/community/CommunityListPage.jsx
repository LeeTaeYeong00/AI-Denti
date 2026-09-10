import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCommunityPosts } from "../../api/communityApi";
import { SERVER_BASE_URL } from "../../api/config";
import CommunityAuthor from "../../components/community/CommunityAuthor";
import { useAuth } from "../../context/AuthContext";

function CommunityListPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [posts, setPosts] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;

        const loadPosts = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getCommunityPosts(
                    keyword,
                    currentPage,
                    10
                );

                if (!active) {
                    return;
                }

                setPosts(data.posts ?? []);
                setCurrentPage(data.currentPage ?? 0);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (requestError) {
                if (!active) {
                    return;
                }

                console.error(
                    "자유게시판 목록 조회 실패:",
                    requestError
                );

                const message =
                    typeof requestError.response?.data === "string"
                        ? requestError.response.data
                        : "게시글 목록을 불러오지 못했습니다.";

                setError(message);
                setPosts([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadPosts();

        return () => {
            active = false;
        };
    }, [keyword, currentPage, reloadKey]);

    const handleSearch = (event) => {
        event.preventDefault();

        const nextKeyword = keywordInput.trim();

        if (nextKeyword === keyword && currentPage === 0) {
            setReloadKey((value) => value + 1);
            return;
        }

        setKeyword(nextKeyword);
        setCurrentPage(0);
    };

    const handleWrite = () => {
        if (!loginUser) {
            navigate("/login");
            return;
        }

        navigate("/community/write");
    };

    const handlePostKeyDown = (
        event,
        postId
    ) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/community/${postId}`);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString("ko-KR");
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

    return (
        <div className="page page--wide">
            <div className="page-header">
                <div className="page-header__row">
                    <div>
                        <span className="eyebrow">
                            COMMUNITY
                        </span>

                        <h1 style={{ fontSize: 30 }}>
                            자유게시판
                        </h1>

                        <p style={{ marginTop: 6 }}>
                            차량과 정비에 관한 이야기를 자유롭게 나눠보세요.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleWrite}
                    >
                        글쓰기
                    </button>
                </div>
            </div>

            <div className="card community-list-toolbar">
                <form
                    className="community-search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        className="input"
                        value={keywordInput}
                        onChange={(event) =>
                            setKeywordInput(event.target.value)
                        }
                        placeholder="제목 또는 내용으로 검색"
                        aria-label="자유게시판 검색어"
                    />

                    <button
                        type="submit"
                        className="btn btn-secondary"
                    >
                        검색
                    </button>
                </form>

                <span className="community-list-count">
                    총 {totalElements.toLocaleString()}개
                </span>
            </div>

            {loading ? (
                <div className="empty-state">
                    게시글을 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="empty-state">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                            setReloadKey((value) => value + 1)
                        }
                        style={{ marginTop: 14 }}
                    >
                        다시 시도
                    </button>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    {keyword
                        ? "검색 결과가 없습니다."
                        : "아직 작성된 게시글이 없습니다."}
                </div>
            ) : (
                <div className="community-post-list">
                    {posts.map((post) => (
                        <article
                            key={post.postId}
                            className={`community-post-card ${
                                post.thumbnailUrl
                                    ? "community-post-card--with-image"
                                    : ""
                            }`}
                            role="link"
                            tabIndex={0}
                            onClick={() =>
                                navigate(`/community/${post.postId}`)
                            }
                            onKeyDown={(event) =>
                                handlePostKeyDown(
                                    event,
                                    post.postId
                                )
                            }
                        >
                            <div className="community-post-card__body">
                                <div className="community-post-card__head">
                                    <CommunityAuthor
                                        nickname={post.writerNickname}
                                        writerShops={post.writerShops}
                                    />

                                    <time
                                        className="community-post-card__date"
                                        dateTime={post.createdAt}
                                    >
                                        {formatDate(post.createdAt)}
                                    </time>
                                </div>

                                <h2 className="community-post-card__title">
                                    {post.title}
                                </h2>

                                <div className="community-post-card__meta">
                                    <span>
                                        조회 {post.viewCount ?? 0}
                                    </span>
                                    <span>
                                        좋아요 {post.likeCount ?? 0}
                                    </span>
                                    <span>
                                        댓글 {post.commentCount ?? 0}
                                    </span>
                                </div>
                            </div>

                            {post.thumbnailUrl && (
                                <img
                                    className="community-post-card__thumbnail"
                                    src={getImageUrl(post.thumbnailUrl)}
                                    alt={`${post.title} 첨부 이미지`}
                                />
                            )}
                        </article>
                    ))}
                </div>
            )}

            {!loading && !error && totalPages > 1 && (
                <div className="pager">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={currentPage === 0}
                        onClick={() =>
                            setCurrentPage((page) => page - 1)
                        }
                    >
                        이전
                    </button>

                    <span>
                        {currentPage + 1} / {totalPages}
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={currentPage + 1 >= totalPages}
                        onClick={() =>
                            setCurrentPage((page) => page + 1)
                        }
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default CommunityListPage;