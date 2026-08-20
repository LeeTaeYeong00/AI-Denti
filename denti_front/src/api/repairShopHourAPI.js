import axios from "axios";
import { axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소 영업시간 조회
export const getRepairShopHours = async (shopId) => {
    const response = await api.get(
        `/api/repair-shops/${shopId}/hours`
    );

    return response.data;
};