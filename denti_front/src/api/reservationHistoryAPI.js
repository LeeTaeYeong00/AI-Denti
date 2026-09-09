import axios from "axios";
import { ENDPOINTS, axiosConfig } from "./config";

const api = axios.create(axiosConfig);

// 특정 예약의 상태 변경 이력 조회
export const getReservationHistories = async (reservationId) => {
    const response = await api.get(ENDPOINTS.RESERVATION_HISTORY.BY_RESERVATION(reservationId));
    return response.data;
};
