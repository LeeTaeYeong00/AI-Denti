import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소 영업시간 조회
export const getRepairShopHours = async (shopId) => {
    const response = await api.get(ENDPOINTS.REPAIR_SHOP_HOUR.BY_SHOP(shopId));
    return response.data;
};
