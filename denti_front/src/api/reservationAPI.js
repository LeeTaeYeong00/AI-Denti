import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 정비소의 특정 날짜 예약 가능 시간 조회
export const getAvailableTimes = async (shopId, date) => {
    const response = await api.get(ENDPOINTS.RESERVATION.AVAILABLE_TIMES(shopId), {
        params: { date },
    });

    return response.data;
};

// 예약 신청
export const createReservation = async (reservationData) => {
    const response = await api.post(ENDPOINTS.RESERVATION.BASE, reservationData);
    return response.data;
};

// 내 예약 목록 조회
export const getMyReservations = async (userId) => {
    const response = await api.get(ENDPOINTS.RESERVATION.BY_USER(userId));
    return response.data;
};

// 예약 취소
export const cancelReservation = async (reservationId) => {
    const response = await api.delete(ENDPOINTS.RESERVATION.DETAIL(reservationId));
    return response.data;
};

// 정비소 기준 예약 목록 조회
export const getShopReservations = async (shopId) => {
    const response = await api.get(ENDPOINTS.RESERVATION.BY_SHOP(shopId));
    return response.data;
};

// 예약 상태 변경
export const updateReservationStatus = async (reservationId, status) => {
    const response = await api.put(ENDPOINTS.RESERVATION.STATUS(reservationId), null, {
        params: { status },
    });

    return response.data;
};

// 예약 가능 시간 개별 등록 (사장님용)
export const createAvailableTime = async (data) => {
    const response = await api.post(ENDPOINTS.RESERVATION.AVAILABLE_TIMES_BASE, data);
    return response.data;
};

// 예약 가능 시간 자동 생성 (사장님용)
export const createAvailableTimesBulk = async (data) => {
    const response = await api.post(`${ENDPOINTS.RESERVATION.AVAILABLE_TIMES_BASE}/bulk`, data);
    return response.data;
};

// 예약 가능 시간 정원 수정 (사장님용)
export const updateAvailableTimeCapacity = async (availableTimeId, capacity) => {
    const response = await api.put(`${ENDPOINTS.RESERVATION.AVAILABLE_TIMES_BASE}/${availableTimeId}`, { capacity });
    return response.data;
};

// 예약 가능 시간 삭제 (사장님용)
export const deleteAvailableTime = async (availableTimeId) => {
    await api.delete(`${ENDPOINTS.RESERVATION.AVAILABLE_TIMES_BASE}/${availableTimeId}`);
};