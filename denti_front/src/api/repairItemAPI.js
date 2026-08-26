import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소별 활성화된 판매 품목 조회
export const getRepairItemsByShop = async (shopId) => {
    const response = await api.get(
        ENDPOINTS.REPAIR_ITEM.BY_SHOP(shopId)
    );

    return response.data;
};

// 판매 품목 등록
export const createRepairItem = async (shopId, data) => {
    const response = await api.post(
        ENDPOINTS.REPAIR_ITEM.BY_SHOP(shopId),
        data
    );

    return response.data;
};

// 판매 품목 수정
export const updateRepairItem = async (itemId, data) => {
    const response = await api.put(
        ENDPOINTS.REPAIR_ITEM.BY_ID(itemId),
        data
    );

    return response.data;
};

// 판매 품목 비활성화
export const deleteRepairItem = async (itemId) => {
    const response = await api.delete(
        ENDPOINTS.REPAIR_ITEM.BY_ID(itemId)
    );

    return response.data;
};