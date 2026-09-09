import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소 영업시간 조회
export const getRepairShopHours = async (shopId) => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP_HOUR.BY_SHOP(shopId));
    return response.data;
};

// 정비소 영업시간 등록
export const createRepairShopHour = async (shopId, data) => {
    const response = await api.post(ENDPOINTS.REPAIR_SHOP_HOUR.BY_SHOP(shopId), data);
    return response.data;
};

// 정비소 영업시간 수정
export const updateRepairShopHour = async (shopId, hourId, data) => {
    const response = await api.put(`${ENDPOINTS.REPAIR_SHOP_HOUR.BY_SHOP(shopId)}/${hourId}`, data);
    return response.data;
};

// 정비소 영업시간 전체 삭제
export const deleteRepairShopHours = async (shopId) => {
    await api.delete(ENDPOINTS.REPAIR_SHOP_HOUR.BY_SHOP(shopId));
};