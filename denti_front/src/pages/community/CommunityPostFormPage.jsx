import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    createCommunityPost,
    deleteCommunityPostImage,
    getCommunityPost,
    updateCommunityPost,
    uploadCommunityPostImages,
} from "../../api/communityApi";
import { SERVER_BASE_URL } from "../../api/config";
import { useAuth } from "../../context/AuthContext";

const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

function CommunityPostFormPage() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { loginUser } = useAuth();

    const isEdit = Boolean(postId);
    const currentUserId = loginUser?.userId;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const [canEdit, setCanEdit] = useState(!isEdit);
    const [error, setError] = useState("");

    const previewUrlsRef = useRef([]);

    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach((previewUrl) => {
                URL.revokeObjectURL(previewUrl);
            });
        };
    }, []);

    useEffect(() => {
        if (!isEdit) {
            return undefined;
        }

        let active = true;

        const loadPost = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getCommunityPost(postId);

                if (!active) {
                    return;
                }

                if (
                    currentUserId == null ||
                    String(currentUserId) !== String(data.writerId)
                ) {
                    setCanEdit(false);
                    setError("본인의 게시글만 수정할 수 있습니다.");
                    return;
                }

                setTitle(data.title ?? "");
                setContent(data.content ?? "");
                setExistingImages(data.images ?? []);
                setCanEdit(true);
            } catch (requestError) {
                if (!active) {
                    return;
                }

                console.error(
                    "게시글 수정 정보 조회 실패:",
                    requestError
                );

                setCanEdit(false);
                setError(
                    getErrorMessage(
                        requestError,
                        "게시글 정보를 불러오지 못했습니다."
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
    }, [isEdit, postId, currentUserId]);

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

    const validateImage = (file) => {
        const validExtension = /\.(jpe?g|png)$/i.test(file.name);
        const validType =
            file.type === "image/jpeg" ||
            file.type === "image/png";

        if (!validExtension || !validType) {
            return "JPG, JPEG, PNG 파일만 선택할 수 있습니다.";
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return "이미지 한 장의 크기는 5MB를 초과할 수 없습니다.";
        }

        return "";
    };

    const handleImageSelect = (event) => {
        const selectedFiles = Array.from(
            event.target.files ?? []
        );

        event.target.value = "";

        if (selectedFiles.length === 0) {
            return;
        }

        const currentImageCount =
            existingImages.length + newImages.length;

        if (
            currentImageCount + selectedFiles.length >
            MAX_IMAGE_COUNT
        ) {
            setError("게시글 이미지는 최대 3장까지 선택할 수 있습니다.");
            return;
        }

        for (const file of selectedFiles) {
            const validationMessage = validateImage(file);

            if (validationMessage) {
                setError(validationMessage);
                return;
            }
        }

        const additions = selectedFiles.map((file) => {
            const previewUrl = URL.createObjectURL(file);

            previewUrlsRef.current.push(previewUrl);

            return {
                file,
                previewUrl,
            };
        });

        setNewImages((images) => [
            ...images,
            ...additions,
        ]);
        setError("");
    };

    const handleRemoveNewImage = (targetIndex) => {
        setNewImages((images) => {
            const targetImage = images[targetIndex];

            if (targetImage) {
                URL.revokeObjectURL(targetImage.previewUrl);

                previewUrlsRef.current =
                    previewUrlsRef.current.filter(
                        (previewUrl) =>
                            previewUrl !== targetImage.previewUrl
                    );
            }

            return images.filter(
                (_, index) => index !== targetIndex
            );
        });
    };

    const handleDeleteExistingImage = async (postImageId) => {
        if (!window.confirm("이 이미지를 삭제하시겠습니까?")) {
            return;
        }

        try {
            setDeletingImageId(postImageId);
            setError("");

            await deleteCommunityPostImage(postImageId);

            setExistingImages((images) =>
                images.filter(
                    (image) => image.postImageId !== postImageId
                )
            );
        } catch (requestError) {
            console.error(
                "게시글 이미지 삭제 실패:",
                requestError
            );

            setError(
                getErrorMessage(
                    requestError,
                    "이미지를 삭제하지 못했습니다."
                )
            );
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const normalizedTitle = title.trim();
        const normalizedContent = content.trim();

        if (!normalizedTitle) {
            setError("게시글 제목을 입력해주세요.");
            return;
        }

        if (!normalizedContent) {
            setError("게시글 내용을 입력해주세요.");
            return;
        }

        if (title.length > 150) {
            setError("게시글 제목은 150자 이하로 작성해주세요.");
            return;
        }

        if (content.length > 10000) {
            setError("게시글 내용은 10000자 이하로 작성해주세요.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const savedPost = isEdit
                ? await updateCommunityPost(postId, {
                      title: normalizedTitle,
                      content: normalizedContent,
                  })
                : await createCommunityPost({
                      title: normalizedTitle,
                      content: normalizedContent,
                  });

            const savedPostId = savedPost.postId;

            if (newImages.length > 0) {
                try {
                    await uploadCommunityPostImages(
                        savedPostId,
                        newImages.map((image) => image.file)
                    );
                } catch (uploadError) {
                    console.error(
                        "게시글 이미지 업로드 실패:",
                        uploadError
                    );

                    window.alert(
                        "게시글은 저장되었지만 이미지를 업로드하지 못했습니다."
                    );
                }
            }

            navigate(`/community/${savedPostId}`, {
                replace: true,
            });
        } catch (requestError) {
            console.error(
                isEdit
                    ? "게시글 수정 실패:"
                    : "게시글 등록 실패:",
                requestError
            );

            setError(
                getErrorMessage(
                    requestError,
                    isEdit
                        ? "게시글을 수정하지 못했습니다."
                        : "게시글을 등록하지 못했습니다."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (isEdit) {
            navigate(`/community/${postId}`);
            return;
        }

        navigate("/community");
    };

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    게시글 정보를 불러오는 중입니다.
                </div>
            </div>
        );
    }

    if (isEdit && !canEdit) {
        return (
            <div className="page">
                <div className="empty-state">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate("/community")}
                        style={{ marginTop: 14 }}
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }

    const totalImageCount =
        existingImages.length + newImages.length;

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">
                    {isEdit ? "EDIT POST" : "NEW POST"}
                </span>

                <h1 style={{ fontSize: 30 }}>
                    {isEdit ? "게시글 수정" : "게시글 작성"}
                </h1>

                <p style={{ marginTop: 6 }}>
                    제목과 내용을 작성하고 이미지를 최대 3장까지 첨부할 수 있습니다.
                </p>
            </div>

            <form
                className="card community-form-card"
                onSubmit={handleSubmit}
            >
                <div className="field">
                    <label
                        className="field-label"
                        htmlFor="community-title"
                    >
                        제목
                    </label>

                    <input
                        id="community-title"
                        type="text"
                        className="input"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        maxLength={150}
                        placeholder="게시글 제목을 입력하세요"
                        disabled={submitting}
                    />

                    <span className="community-form__counter">
                        {title.length} / 150
                    </span>
                </div>

                <div className="field">
                    <label
                        className="field-label"
                        htmlFor="community-content"
                    >
                        내용
                    </label>

                    <textarea
                        id="community-content"
                        className="textarea community-form__textarea"
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        maxLength={10000}
                        placeholder="차량과 정비에 관한 이야기를 자유롭게 작성해보세요"
                        disabled={submitting}
                    />

                    <span className="community-form__counter">
                        {content.length.toLocaleString()} / 10,000
                    </span>
                </div>

                <div className="field">
                    <div className="community-image-field__head">
                        <span className="field-label">
                            이미지
                        </span>

                        <span className="community-form__counter">
                            {totalImageCount} / 3
                        </span>
                    </div>

                    <label
                        className={`community-file-picker ${
                            totalImageCount >= MAX_IMAGE_COUNT
                                ? "community-file-picker--disabled"
                                : ""
                        }`}
                    >
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            multiple
                            onChange={handleImageSelect}
                            disabled={
                                submitting ||
                                totalImageCount >= MAX_IMAGE_COUNT
                            }
                        />

                        <span>이미지 선택</span>
                        <small>
                            JPG, JPEG, PNG · 장당 최대 5MB
                        </small>
                    </label>

                    {totalImageCount > 0 && (
                        <div className="community-image-grid">
                            {existingImages.map((image) => (
                                <div
                                    key={image.postImageId}
                                    className="community-image-item"
                                >
                                    <img
                                        src={getImageUrl(image.imageUrl)}
                                        alt={image.originalName}
                                    />

                                    <button
                                        type="button"
                                        className="community-image-item__remove"
                                        onClick={() =>
                                            handleDeleteExistingImage(
                                                image.postImageId
                                            )
                                        }
                                        disabled={
                                            submitting ||
                                            deletingImageId ===
                                                image.postImageId
                                        }
                                        aria-label={`${image.originalName} 삭제`}
                                    >
                                        {deletingImageId === image.postImageId
                                            ? "…"
                                            : "×"}
                                    </button>
                                </div>
                            ))}

                            {newImages.map((image, index) => (
                                <div
                                    key={image.previewUrl}
                                    className="community-image-item"
                                >
                                    <img
                                        src={image.previewUrl}
                                        alt={image.file.name}
                                    />

                                    <button
                                        type="button"
                                        className="community-image-item__remove"
                                        onClick={() =>
                                            handleRemoveNewImage(index)
                                        }
                                        disabled={submitting}
                                        aria-label={`${image.file.name} 선택 취소`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                <div className="community-form-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleCancel}
                        disabled={submitting}
                    >
                        취소
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting
                            ? "저장 중..."
                            : isEdit
                              ? "수정 완료"
                              : "등록하기"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CommunityPostFormPage;
