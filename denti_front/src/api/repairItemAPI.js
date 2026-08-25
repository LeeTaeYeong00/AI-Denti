import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소별 활성화된 정비 항목 조회
export const getRepairItemsByShop = async (shopId) => {
    const response = await api.get(ENDPOINTS.REPAIR_ITEM.BY_SHOP(shopId));
    return response.data;
};
