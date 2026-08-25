import axios from "axios";
import { ENDPOINTS, axiosConfig, uploadAxiosConfig } from "./config";

const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

// 임시 로그인 사용자 번호를 헤더에 담는다.
// 나중에 로그인 기능이 연결되면 인증 방식에 맞게 변경한다.
const userConfig = (userId) => {
    if (!userId) {
        return {};
    }

    return {
        headers: {
            "X-User-Id": userId,
        },
    };
};

// 리뷰를 등록한다.
export const createReview = (userId, data) => {
    return api.post(ENDPOINTS.REVIEW.BASE, data, userConfig(userId));
};

// 리뷰 한 건을 조회한다.
export const getReview = (reviewId, userId) => {
    return api.get(ENDPOINTS.REVIEW.DETAIL(reviewId), userConfig(userId));
};

// 특정 정비소의 리뷰 목록과 평균 평점을 조회한다.
export const getShopReviews = (shopId, userId, page = 0, size = 10) => {
    return api.get(ENDPOINTS.REVIEW.BY_SHOP(shopId), {
        ...userConfig(userId),
        params: { page, size },
    });
};

// 리뷰를 수정한다.
export const updateReview = (reviewId, userId, data) => {
    return api.put(ENDPOINTS.REVIEW.DETAIL(reviewId), data, userConfig(userId));
};

// 리뷰를 삭제한다.
export const deleteReview = (reviewId, userId) => {
    return api.delete(ENDPOINTS.REVIEW.DETAIL(reviewId), userConfig(userId));
};

// 리뷰 좋아요를 등록하거나 취소한다.
export const toggleReviewLike = (reviewId, userId) => {
    return api.post(ENDPOINTS.REVIEW.LIKE(reviewId), null, userConfig(userId));
};

// 정비소 답변을 등록한다.
export const createReviewReply = (reviewId, shopOwnerId, data) => {
    return api.post(ENDPOINTS.REVIEW.REPLY(reviewId), data, userConfig(shopOwnerId));
};

// 리뷰에 이미지를 등록한다.
export const uploadReviewImages = (reviewId, userId, files) => {
    const formData = new FormData();

    // 여러 이미지 파일을 동일한 files 이름으로 담는다.
    Array.from(files).forEach((file) => {
        formData.append("files", file);
    });

    return uploadApi.post(ENDPOINTS.REVIEW.IMAGES(reviewId), formData, userConfig(userId));
};

// 리뷰 이미지 한 장을 삭제한다.
export const deleteReviewImage = (reviewImageId, userId) => {
    return api.delete(ENDPOINTS.REVIEW.IMAGE_DETAIL(reviewImageId), userConfig(userId));
};

// 현재 로그인한 사용자가 작성한 리뷰 목록을 조회한다.
export const getMyReviews = (userId, page = 0, size = 5) => {
    return api.get(ENDPOINTS.REVIEW.MY, {
        ...userConfig(userId),
        params: { page, size },
    });
};
