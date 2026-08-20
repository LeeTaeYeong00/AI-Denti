import axios from 'axios';
import { axiosConfig, uploadAxiosConfig } from './config';

const api = axios.create(axiosConfig);
const uploadApi = axios.create(uploadAxiosConfig);

export const analyzeImage = async (formData) => {
    const response = await uploadApi.post('/api/ai/analyze', formData);
    return response.data;
};

export const getAiHistory = async () => {
    const response = await api.get('/api/ai/history');
    return response.data;
};

export const getAiHistoryDetail = async (analysisId) => {
    const response = await api.get(`/api/ai/history/${analysisId}`);
    return response.data;
};