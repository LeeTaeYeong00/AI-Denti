import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 주문 생성
export const createOrder = async (data) => {
    const response = await api.post(
        ENDPOINTS.ORDER.BASE,
        data
    );

    return response.data;
};

// 주문 상세 조회
export const getOrder = async (orderId) => {
    const response = await api.get(
        ENDPOINTS.ORDER.DETAIL(orderId)
    );

    return response.data;
};

// 내 주문 목록 조회
export const getMyOrders = async () => {
    const response = await api.get(
        ENDPOINTS.ORDER.MY
    );

    return response.data;
};

// 주문 취소
export const cancelOrder = async (orderId) => {
    const response = await api.patch(
        ENDPOINTS.ORDER.CANCEL(orderId)
    );

    return response.data;
};