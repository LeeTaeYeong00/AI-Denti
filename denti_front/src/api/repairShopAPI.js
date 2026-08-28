import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 전체 정비소 주소(지도 마커용) 조회
export const getRepairShopAddresses = async () => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP.ADDRESSES);
    return response.data;
};

// 정비소 ID로 정비소 상세(주소) 조회
export const getRepairShopByShopId = async (shopId) => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP.ADDRESS_BY_SHOP(shopId));
    return response.data;
};

// 현재 로그인한 정비소 사장님의 정비소 조회
export const getMyRepairShop = async () => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP.MY);
    return response.data;
};
