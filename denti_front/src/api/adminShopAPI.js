import axios from "axios";
import { axiosConfig } from "./config";

const api = axios.create(axiosConfig);

export const getPendingShops = async () => {
    const response = await api.get("/api/admin/repair-shops/pending");
    return response.data;
};

export const approveShop = async (shopId) => {
    const response = await api.put(`/api/admin/repair-shops/${shopId}/approve`);
    return response.data;
};

export const rejectShop = async (shopId, reason) => {
    const response = await api.put(`/api/admin/repair-shops/${shopId}/reject`, { reason });
    return response.data;
};

export const getAllShopApprovalHistory = async () => {
    const response = await api.get("/api/admin/repair-shops/history");
    return response.data;
};