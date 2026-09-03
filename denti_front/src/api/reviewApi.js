import axios from "axios";
import {
    ENDPOINTS,
    axiosConfig,
    uploadAxiosConfig,
} from "./config";

const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

// 리뷰를 등록한다.
// 로그인 사용자는 백엔드 세션에서 확인한다.
export const createReview = (data) => {
    return api.post(
        ENDPOINTS.REVIEW.BASE,
        data
    );
};

// 리뷰 한 건을 조회한다.
export const getReview = (reviewId) => {
    return api.get(
        ENDPOINTS.REVIEW.DETAIL(reviewId)
    );
};

// 특정 정비소의 리뷰 목록과 평균 평점을 조회한다.
export const getShopReviews = (
    shopId,
    page = 0,
    size = 10
) => {
    return api.get(
        ENDPOINTS.REVIEW.BY_SHOP(shopId),
        {
            params: {
                page,
                size,
            },
        }
    );
};

// 리뷰를 수정한다.
export const updateReview = (
    reviewId,
    data
) => {
    return api.put(
        ENDPOINTS.REVIEW.DETAIL(reviewId),
        data
    );
};

// 리뷰를 삭제한다.
export const deleteReview = (reviewId) => {
    return api.delete(
        ENDPOINTS.REVIEW.DETAIL(reviewId)
    );
};

// 리뷰를 좋아요 상태로 만든다.
// 이미 좋아요 상태여도 그대로 유지된다.
export const addReviewLike = (reviewId) => {
    return api.put(
        ENDPOINTS.REVIEW.LIKE(reviewId),
        null
    );
};

// 리뷰를 좋아요 취소 상태로 만든다.
// 이미 취소 상태여도 그대로 유지된다.
export const removeReviewLike = (reviewId) => {
    return api.delete(
        ENDPOINTS.REVIEW.LIKE(reviewId)
    );
};

// 정비소 답변을 등록한다.
export const createReviewReply = (
    reviewId,
    data
) => {
    return api.post(
        ENDPOINTS.REVIEW.REPLY(reviewId),
        data
    );
};

// 정비소 답변을 수정한다.
export const updateReviewReply = (
    reviewId,
    data
) => {
    return api.put(
        ENDPOINTS.REVIEW.REPLY(reviewId),
        data
    );
};

// 정비소 답변을 삭제한다.
export const deleteReviewReply = (reviewId) => {
    return api.delete(
        ENDPOINTS.REVIEW.REPLY(reviewId)
    );
};

// 리뷰에 이미지를 등록한다.
export const uploadReviewImages = (
    reviewId,
    files
) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
        formData.append("files", file);
    });

    return uploadApi.post(
        ENDPOINTS.REVIEW.IMAGES(reviewId),
        formData
    );
};

// 리뷰 이미지 한 장을 삭제한다.
export const deleteReviewImage = (
    reviewImageId
) => {
    return api.delete(
        ENDPOINTS.REVIEW.IMAGE_DETAIL(
            reviewImageId
        )
    );
};

// 현재 로그인한 사용자가 작성한 리뷰 목록을 조회한다.
export const getMyReviews = (
    page = 0,
    size = 5
) => {
    return api.get(
        ENDPOINTS.REVIEW.MY,
        {
            params: {
                page,
                size,
            },
        }
    );
};

// 현재 사용자가 리뷰를 작성한 예약 번호 목록을 조회한다.
export const getMyReviewedReservationIds = () => {
    return api.get(
        `${ENDPOINTS.REVIEW.MY}/reservation-ids`
    );
};