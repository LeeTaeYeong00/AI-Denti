import axios from "axios";
import { axiosConfig } from "./config";

const api = axios.create(axiosConfig);

export const createInquiry = async (data) => {
    const response = await api.post("/api/inquiries", data);
    return response.data;
};

export const getMyInquiries = async () => {
    const response = await api.get("/api/inquiries/my");
    return response.data;
};

export const getAllInquiries = async () => {
    const response = await api.get("/api/admin/inquiries");
    return response.data;
};

export const answerInquiry = async (inquiryId, answer) => {
    const response = await api.put(`/api/admin/inquiries/${inquiryId}/answer`, { answer });
    return response.data;
};