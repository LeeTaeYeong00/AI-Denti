import axios from "axios";
import { axiosConfig } from "./config";

const api = axios.create(axiosConfig);

export const getAllUsers = async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    const response = await api.put(`/api/admin/users/${userId}/status`, { status });
    return response.data;
};

export const withdrawUser = async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
};