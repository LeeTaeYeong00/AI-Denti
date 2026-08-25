import axios from 'axios';
import { ENDPOINTS, axiosConfig } from './config';

const api = axios.create(axiosConfig);

// 차량 등록
export const createVehicle = async (vehicleData) => {
    const response = await api.post(
        ENDPOINTS.VEHICLE.BASE,
        vehicleData
    );

    return response.data;
};

// 내 차량 조회
export const getMyVehicles = async (userId) => {
    const response = await api.get(
        ENDPOINTS.VEHICLE.USER(userId)
    );

    return response.data;
};

// 차량 단건 조회
export const getVehicle = async (vehicleId) => {
    const response = await api.get(
        ENDPOINTS.VEHICLE.DETAIL(vehicleId)
    );

    return response.data;
};

// 차량 수정
export const updateVehicle = async (vehicleId, vehicleData) => {
    const response = await api.put(
        ENDPOINTS.VEHICLE.DETAIL(vehicleId),
        vehicleData
    );

    return response.data;
};

// 차량 삭제
export const deleteVehicle = async (vehicleId) => {
    await api.delete(
        ENDPOINTS.VEHICLE.DETAIL(vehicleId)
    );
};