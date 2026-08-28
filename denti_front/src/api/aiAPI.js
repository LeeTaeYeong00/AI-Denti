import axios from "axios";
import { ENDPOINTS, axiosConfig, uploadAxiosConfig } from "./config";

const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

export const analyzeImage = async (formData) => {
    const response = await uploadApi.post(ENDPOINTS.AI.ANALYZE, formData);
    return response.data;
};

export const getAiHistory = async () => {
    const response = await api.get(ENDPOINTS.AI.HISTORY);
    return response.data;
};

export const getAiHistoryDetail = async (analysisId) => {
    const response = await api.get(ENDPOINTS.AI.HISTORY_DETAIL(analysisId));
    return response.data;
};
