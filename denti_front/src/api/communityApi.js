import axios from "axios";

import {
    ENDPOINTS,
    axiosConfig,
    uploadAxiosConfig,
} from "./config";

const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

// 자유게시판 게시글 목록을 조회한다.
export const getCommunityPosts = async (
    keyword = "",
    page = 0,
    size = 10
) => {
    const response = await api.get(
        ENDPOINTS.COMMUNITY.BASE,
        {
            params: {
                keyword,
                page,
                size,
            },
        }
    );

    return response.data;
};

// 자유게시판 게시글 한 건을 조회한다.
export const getCommunityPost = async (postId) => {
    const response = await api.get(
        ENDPOINTS.COMMUNITY.DETAIL(postId)
    );

    return response.data;
};

// 자유게시판 게시글을 등록한다.
export const createCommunityPost = async (data) => {
    const response = await api.post(
        ENDPOINTS.COMMUNITY.BASE,
        data
    );

    return response.data;
};

// 자유게시판 게시글을 수정한다.
export const updateCommunityPost = async (
    postId,
    data
) => {
    const response = await api.put(
        ENDPOINTS.COMMUNITY.DETAIL(postId),
        data
    );

    return response.data;
};

// 자유게시판 게시글을 삭제한다.
export const deleteCommunityPost = async (postId) => {
    await api.delete(
        ENDPOINTS.COMMUNITY.DETAIL(postId)
    );
};

// 특정 게시글의 댓글 목록을 조회한다.
export const getCommunityComments = async (
    postId,
    page = 0,
    size = 20
) => {
    const response = await api.get(
        ENDPOINTS.COMMUNITY.COMMENTS(postId),
        {
            params: {
                page,
                size,
            },
        }
    );

    return response.data;
};

// 특정 게시글에 댓글을 등록한다.
export const createCommunityComment = async (
    postId,
    data
) => {
    const response = await api.post(
        ENDPOINTS.COMMUNITY.COMMENTS(postId),
        data
    );

    return response.data;
};

// 댓글을 수정한다.
export const updateCommunityComment = async (
    commentId,
    data
) => {
    const response = await api.put(
        ENDPOINTS.COMMUNITY.COMMENT_DETAIL(commentId),
        data
    );

    return response.data;
};

// 댓글을 삭제한다.
export const deleteCommunityComment = async (
    commentId
) => {
    await api.delete(
        ENDPOINTS.COMMUNITY.COMMENT_DETAIL(commentId)
    );
};

// 현재 사용자의 게시글 좋아요 상태를 조회한다.
export const getCommunityPostLikeStatus = async (
    postId
) => {
    const response = await api.get(
        ENDPOINTS.COMMUNITY.LIKE(postId)
    );

    return response.data;
};

// 게시글을 좋아요 상태로 만든다.
export const addCommunityPostLike = async (postId) => {
    const response = await api.put(
        ENDPOINTS.COMMUNITY.LIKE(postId),
        null
    );

    return response.data;
};

// 게시글 좋아요를 취소한다.
export const removeCommunityPostLike = async (
    postId
) => {
    const response = await api.delete(
        ENDPOINTS.COMMUNITY.LIKE(postId)
    );

    return response.data;
};

// 게시글에 이미지를 등록한다.
export const uploadCommunityPostImages = async (
    postId,
    files
) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
        formData.append("files", file);
    });

    const response = await uploadApi.post(
        ENDPOINTS.COMMUNITY.IMAGES(postId),
        formData
    );

    return response.data;
};

// 게시글 이미지 한 장을 삭제한다.
export const deleteCommunityPostImage = async (
    postImageId
) => {
    await api.delete(
        ENDPOINTS.COMMUNITY.IMAGE_DETAIL(postImageId)
    );
};