import axios from 'axios';
import { ENDPOINTS, axiosConfig } from './config';

const api = axios.create(axiosConfig);

export const signup = async (signupData) => {
    const response = await api.post(ENDPOINTS.ACCOUNT.SIGNUP, signupData);
    return response.data;
};

export const login = async (loginData) => {
    const response = await api.post(ENDPOINTS.ACCOUNT.LOGIN, loginData);
    return response.data;
};

export const logout = async () => {
    await api.post(ENDPOINTS.ACCOUNT.LOGOUT);
};

export const getLoginUser = async () => {
    const response = await api.get(ENDPOINTS.ACCOUNT.ME);
    return response.data;
};