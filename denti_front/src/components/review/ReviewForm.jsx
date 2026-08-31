import { useEffect, useRef, useState } from "react";
import {
    createReview,
    deleteReviewImage,
    updateReview,
    uploadReviewImages,
} from "../../api/reviewApi";
import { SERVER_BASE_URL } from "../../api/config";
import { useAuth } from "../../context/AuthContext";

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
];

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
];

// 새로 선택한 이미지의 개수, 확장자, MIME 타입과 크기를 확인한다.
const getFileValidationError = (
    selectedFiles,
    existingImageCount
) => {
    if (
        existingImageCount + selectedFiles.length >
        MAX_IMAGE_COUNT
    ) {
        return "리뷰 이미지는 최대 5장까지 등록할 수 있습니다.";
    }

    for (const file of selectedFiles) {
        const lowerFileName = file.name.toLowerCase();

        const allowedExtension =
            ALLOWED_IMAGE_EXTENSIONS.some(
                (extension) =>
                    lowerFileName.endsWith(extension)
            );

        // 일부 브라우저는 MIME 타입을 비워서 전달할 수 있으므로
        // 값이 있는 경우에만 허용된 타입인지 확인한다.
        const allowedContentType =
            !file.type ||
            ALLOWED_IMAGE_TYPES.includes(
                file.type.toLowerCase()
            );

        if (!allowedExtension || !allowedContentType) {
            return "JPG, JPEG, PNG 파일만 업로드할 수 있습니다.";
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return "이미지 한 장의 크기는 5MB를 초과할 수 없습니다.";
        }
    }

    return "";
};

// 리뷰 등록과 수정을 담당하는 입력 폼이다.
// review가 있으면 수정, 없으면 신규 등록으로 동작한다.
function ReviewForm({
    reservationId,
    review,
    onSuccess,
    onCancel,
}) {
    const { loginUser } = useAuth();
    const fileInputRef = useRef(null);

    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");

    // 서버에 이미 등록된 이미지이다.
    const [existingImages, setExistingImages] =
        useState([]);

    // 수정 완료 시 삭제할 기존 이미지 번호이다.
    const [removedImageIds, setRemovedImageIds] =
        useState([]);

    // 새로 추가할 이미지 파일이다.
    const [files, setFiles] = useState([]);
    const [fileError, setFileError] =
        useState("");

    const [error, setError] = useState("");
    const [submitting, setSubmitting] =
        useState(false);

    const isUpdate = Boolean(review?.reviewId);

    // 수정할 리뷰가 있으면 기존 내용을 표시한다.
    useEffect(() => {
        setRating(review?.rating ?? 5);
        setContent(review?.content ?? "");
        setExistingImages(review?.images ?? []);
        setRemovedImageIds([]);
        setFiles([]);
        setFileError("");
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [review]);

    // 사용자가 새로 첨부한 이미지 파일을 저장한다.
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files
        );

        const validationError =
            getFileValidationError(
                selectedFiles,
                existingImages.length
            );

        setFiles(selectedFiles);
        setFileError(validationError);
        setError("");
    };

    // 새로 선택한 이미지 목록을 초기화한다.
    const handleClearSelectedFiles = () => {
        setFiles([]);
        setFileError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // 기존 이미지를 삭제 예정 상태로 변경한다.
    // 실제 서버 삭제는 수정 완료를 누를 때 진행한다.
    const handleRemoveExistingImage = (
        reviewImageId
    ) => {
        const confirmed = window.confirm(
            "이 이미지를 삭제하시겠습니까?"
        );

        if (!confirmed) {
            return;
        }

        const nextExistingImages =
            existingImages.filter(
                (image) =>
                    image.reviewImageId !==
                    reviewImageId
            );

        setExistingImages(nextExistingImages);

        setFileError(
            getFileValidationError(
                files,
                nextExistingImages.length
            )
        );

        setRemovedImageIds((previous) => [
            ...previous,
            reviewImageId,
        ]);

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!loginUser) {
            setError(
                "로그인 후 리뷰를 작성할 수 있습니다."
            );

            return;
        }

        if (rating < 1 || rating > 5) {
            setError(
                "별점은 1점부터 5점까지 선택해야 합니다."
            );

            return;
        }

        if (!content.trim()) {
            setError(
                "리뷰 내용을 입력해야 합니다."
            );

            return;
        }

        const validationError =
            getFileValidationError(
                files,
                existingImages.length
            );

        if (validationError) {
            setFileError(validationError);
            setError("");

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const requestData = {
                rating: Number(rating),
                content: content.trim(),
            };

            let response;

            if (isUpdate) {
                response = await updateReview(
                    review.reviewId,
                    requestData
                );
            } else {
                response = await createReview({
                    reservationId:
                        Number(reservationId),
                    ...requestData,
                });
            }

            let savedReview = response.data;

            // 수정 화면에서 삭제한 기존 이미지를 서버에서도 삭제한다.
            if (
                isUpdate &&
                removedImageIds.length > 0
            ) {
                try {
                    for (
                        const reviewImageId of
                        removedImageIds
                    ) {
                        await deleteReviewImage(
                            reviewImageId
                        );
                    }

                    savedReview = {
                        ...savedReview,
                        images: (
                            savedReview.images ?? []
                        ).filter(
                            (image) =>
                                !removedImageIds.includes(
                                    image.reviewImageId
                                )
                        ),
                    };
                } catch (imageDeleteError) {
                    console.error(
                        "기존 이미지 삭제 실패:",
                        imageDeleteError
                    );

                    alert(
                        "리뷰 내용은 저장되었지만 일부 이미지 삭제에 실패했습니다."
                    );
                }
            }

            // 새로 선택한 이미지를 서버에 등록한다.
            if (files.length > 0) {
                try {
                    const imageResponse =
                        await uploadReviewImages(
                            savedReview.reviewId,
                            files
                        );

                    savedReview = {
                        ...savedReview,
                        images: [
                            ...(savedReview.images ??
                                []),
                            ...imageResponse.data,
                        ],
                    };
                } catch (imageError) {
                    console.error(
                        "이미지 업로드 실패:",
                        imageError
                    );

                    const imageResponseMessage =
                        typeof imageError.response
                            ?.data === "string"
                            ? imageError.response.data
                            : imageError.response
                                  ?.data?.message;

                    alert(
                        imageResponseMessage ||
                            "리뷰는 저장되었지만 이미지 업로드에 실패했습니다."
                    );
                }
            }

            setFiles([]);
            setFileError("");
            setRemovedImageIds([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            onSuccess?.(savedReview);
        } catch (error) {
            console.error(error);

            const responseMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : error.response?.data
                          ?.message;

            setError(
                responseMessage ||
                    "리뷰 저장에 실패했습니다."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="card"
        >
            <h3 style={{ marginBottom: 16 }}>
                {isUpdate
                    ? "리뷰 수정"
                    : "리뷰 작성"}
            </h3>

            <div className="field">
                <label
                    className="field-label"
                    htmlFor="review-rating"
                >
                    별점
                </label>

                <select
                    id="review-rating"
                    className="select"
                    style={{ maxWidth: 120 }}
                    value={rating}
                    onChange={(event) =>
                        setRating(
                            Number(
                                event.target.value
                            )
                        )
                    }
                >
                    <option value={5}>5점</option>
                    <option value={4}>4점</option>
                    <option value={3}>3점</option>
                    <option value={2}>2점</option>
                    <option value={1}>1점</option>
                </select>
            </div>

            <div className="field">
                <label
                    className="field-label"
                    htmlFor="review-content"
                >
                    리뷰 내용
                </label>

                <textarea
                    id="review-content"
                    className="textarea"
                    value={content}
                    rows={5}
                    onChange={(event) =>
                        setContent(
                            event.target.value
                        )
                    }
                />
            </div>

            <div className="field">
                <label className="field-label">
                    기존 등록 이미지
                </label>

                {existingImages.length === 0 ? (
                    <p
                        style={{
                            fontSize: 13,
                            color: "var(--color-ink-faint)",
                        }}
                    >
                        등록된 이미지가 없습니다.
                    </p>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            marginBottom: 12,
                        }}
                    >
                        {existingImages.map(
                            (image) => (
                                <div
                                    key={
                                        image.reviewImageId
                                    }
                                    style={{
                                        width: 130,
                                    }}
                                >
                                    <img
                                        src={`${SERVER_BASE_URL}${image.imageUrl}`}
                                        alt={
                                            image.originalName
                                        }
                                        style={{
                                            display:
                                                "block",
                                            width: 130,
                                            height: 90,
                                            objectFit:
                                                "cover",
                                            borderRadius: 8,
                                            marginBottom: 6,
                                        }}
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        style={{
                                            width: "100%",
                                        }}
                                        onClick={() =>
                                            handleRemoveExistingImage(
                                                image.reviewImageId
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        이미지 삭제
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}

                {removedImageIds.length > 0 && (
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--color-signal-hover)",
                            marginBottom: 10,
                        }}
                    >
                        기존 이미지{" "}
                        {removedImageIds.length}장이
                        삭제 예정입니다.
                    </p>
                )}

                <label
                    className="field-label"
                    htmlFor="review-images"
                >
                    새 이미지 추가
                </label>

                <input
                    id="review-images"
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                    disabled={submitting}
                />

                {files.length > 0 && (
                    <ul
                        style={{
                            margin: "8px 0 0",
                            paddingLeft: 18,
                            fontSize: 13,
                            color: "var(--color-ink-soft)",
                        }}
                    >
                        {files.map((file) => (
                            <li
                                key={`${file.name}-${file.lastModified}`}
                            >
                                {file.name} ({
                                    (
                                        file.size /
                                        1024 /
                                        1024
                                    ).toFixed(2)
                                } MB)
                            </li>
                        ))}
                    </ul>
                )}

                {fileError && (
                    <p
                        className="form-error"
                        style={{ marginTop: 8 }}
                    >
                        {fileError}
                    </p>
                )}

                {files.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={
                            handleClearSelectedFiles
                        }
                        disabled={submitting}
                    >
                        선택 이미지 초기화
                    </button>
                )}

                <p
                    style={{
                        fontSize: 12,
                        color: "var(--color-ink-faint)",
                        marginTop: 6,
                    }}
                >
                    기존 {existingImages.length}장
                    {" + "}
                    새 이미지 {files.length}장 /
                    최대 5장 · 한 장당 최대 5MB
                </p>
            </div>

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <div
                style={{
                    display: "flex",
                    gap: 8,
                }}
            >
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting
                        ? "저장 중..."
                        : isUpdate
                          ? "수정 완료"
                          : "리뷰 등록"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        취소
                    </button>
                )}
            </div>
        </form>
    );
}

export default ReviewForm;
