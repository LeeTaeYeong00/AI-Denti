import axios from "axios";
import { ENDPOINTS, axiosConfig, uploadAxiosConfig } from "./config";


const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

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
export const getMyRepairShops = async () => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP.MY);
    return response.data;
};

export const registerRepairShop = async (data, businessDocFile) => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    formData.append("businessDoc", businessDocFile);

    const response = await uploadApi.post(ENDPOINTS.REPAIR_SHOP.BASE, formData);
    return response.data;
};

export const deleteRepairShop = async (shopId) => {
    await api.delete(`${ENDPOINTS.REPAIR_SHOP.BASE}/${shopId}`);
};

export const resubmitRepairShop = async (shopId, data, businessDocFile) => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (businessDocFile) {
        formData.append("businessDoc", businessDocFile);
    }

    const response = await uploadApi.put(`${ENDPOINTS.REPAIR_SHOP.BASE}/${shopId}/resubmit`, formData);
    return response.data;
};

export const getShopHistory = async (shopId) => {
    const response = await api.get(`${ENDPOINTS.REPAIR_SHOP.BASE}/${shopId}/history`);
    return response.data;
};