import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 내 정비 이력 조회
export const getRepairHistoriesByUser = async (userId) => {
    const response = await api.get(ENDPOINTS.REPAIR_HISTORY.BY_USER(userId));
    return response.data;
};
