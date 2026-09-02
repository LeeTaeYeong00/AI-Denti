import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 전체 판매 상품 조회
export const getAllProducts = async () => {
    const response = await api.get(
        ENDPOINTS.PRODUCT.ALL
    );

    return response.data;
};

// 정비소별 판매 상품 조회
export const getProductsByShop = async (shopId) => {
    const response = await api.get(
        ENDPOINTS.PRODUCT.BY_SHOP(shopId)
    );

    return response.data;
};

// 상품 상세 조회
export const getProduct = async (productId) => {
    const response = await api.get(
        ENDPOINTS.PRODUCT.BY_ID(productId)
    );

    return response.data;
};

// 상품 등록
export const createProduct = async (shopId, data) => {
    const response = await api.post(
        ENDPOINTS.PRODUCT.BY_SHOP(shopId),
        data
    );

    return response.data;
};

// 상품 수정
export const updateProduct = async (productId, data) => {
    const response = await api.put(
        ENDPOINTS.PRODUCT.BY_ID(productId),
        data
    );

    return response.data;
};

// 상품 판매 중지
export const deleteProduct = async (productId) => {
    const response = await api.delete(
        ENDPOINTS.PRODUCT.BY_ID(productId)
    );

    return response.data;
};