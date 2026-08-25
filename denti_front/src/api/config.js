export const axiosConfig = {
    baseURL: 'http://localhost:8080',
    withCredentials: true, // 세션 쿠키를 요청마다 자동으로 실어 보내기 위해 필수
    headers: { 'Content-Type': 'application/json' },
};

export const uploadAxiosConfig = {
    baseURL: 'http://localhost:8080',
    withCredentials: true,
};

export const ENDPOINTS = {
    ACCOUNT: {
        SIGNUP: '/api/auth/signup',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
    },

    VEHICLE: {
        BASE: '/api/vehicles',
        USER: (userId) => `/api/vehicles/user/${userId}`,
        DETAIL: (vehicleId) => `/api/vehicles/${vehicleId}`,
    },
};