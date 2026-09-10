export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const axiosConfig = {
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
};

export const uploadAxiosConfig = {
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
};

export const ENDPOINTS = {
    ACCOUNT: {
        SIGNUP: "/api/auth/signup",
        LOGIN: "/api/auth/login",
        LOGOUT: "/api/auth/logout",
        ME: "/api/auth/me",
    },

    VEHICLE: {
        BASE: "/api/vehicles",
        USER: (userId) => `/api/vehicles/user/${userId}`,
        DETAIL: (vehicleId) => `/api/vehicles/${vehicleId}`,
    },

    AI: {
        ANALYZE: "/api/ai/analyze",
        HISTORY: "/api/ai/history",
        HISTORY_DETAIL: (analysisId) => `/api/ai/history/${analysisId}`,
    },

    REPAIR_HISTORY: {
        BY_USER: (userId) => `/api/repair-histories/user/${userId}`,
    },

    REPAIR_ITEM: {
        ALL: "/api/repair-items",
        BY_SHOP: (shopId) => `/api/repair-items/shop/${shopId}`,
        BY_ID: (itemId) => `/api/repair-items/${itemId}`,
    },

    PRODUCT: {
        ALL: "/api/products",
        BY_SHOP: (shopId) => `/api/products/shop/${shopId}`,
        BY_ID: (productId) => `/api/products/${productId}`,
    },

    REPAIR_SHOP_HOUR: {
        BY_SHOP: (shopId) => `/api/repair-shops/${shopId}/hours`,
    },

    REPAIR_SHOP: {
        BASE: "/api/repair-shops",
        ADDRESSES: "/api/repair-shop-addresses",
        ADDRESS_BY_SHOP: (shopId) => `/api/repair-shop-addresses/shop/${shopId}`,
        MY: "/api/repair-shops/my",
    },

    ORDER: {
        BASE: "/api/orders",
        DETAIL: (orderId) => `/api/orders/${orderId}`,
        MY: "/api/orders/my",
        CANCEL: (orderId) => `/api/orders/${orderId}/cancel`,
    },

    RESERVATION_HISTORY: {
        BY_RESERVATION: (reservationId) =>
            `/api/reservation-histories/reservation/${reservationId}`,
    },

    REVIEW: {
        BASE: "/api/reviews",
        DETAIL: (reviewId) => `/api/reviews/${reviewId}`,
        BY_SHOP: (shopId) => `/api/reviews/shops/${shopId}`,
        LIKE: (reviewId) => `/api/reviews/${reviewId}/like`,
        REPLY: (reviewId) => `/api/reviews/${reviewId}/reply`,
        IMAGES: (reviewId) => `/api/reviews/${reviewId}/images`,
        IMAGE_DETAIL: (reviewImageId) => `/api/reviews/images/${reviewImageId}`,
        MY: "/api/reviews/my",
    },

    COMMUNITY: {
        BASE: "/api/community/posts",
        DETAIL: (postId) => `/api/community/posts/${postId}`,

        COMMENTS: (postId) =>
            `/api/community/posts/${postId}/comments`,
        COMMENT_DETAIL: (commentId) =>
            `/api/community/comments/${commentId}`,

        LIKE: (postId) =>
            `/api/community/posts/${postId}/like`,

        IMAGES: (postId) =>
            `/api/community/posts/${postId}/images`,
        IMAGE_DETAIL: (postImageId) =>
            `/api/community/images/${postImageId}`,
    },

    RESERVATION: {
        BASE: "/api/reservations",
        DETAIL: (reservationId) => `/api/reservations/${reservationId}`,
        STATUS: (reservationId) => `/api/reservations/${reservationId}/status`,
        BY_USER: (userId) => `/api/reservations/user/${userId}`,
        BY_SHOP: (shopId) => `/api/reservations/shop/${shopId}`,
        AVAILABLE_TIMES: (shopId) => `/api/available-times/shop/${shopId}`,
        AVAILABLE_TIMES_BASE: "/api/available-times",
    },
};