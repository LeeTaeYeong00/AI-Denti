
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// 특정 예약의 상태 변경 이력 조회
export const getReservationHistories = async (reservationId) => {
    const response = await api.get(
        `/api/reservation-histories/reservation/${reservationId}`
    );

    return response.data;
};