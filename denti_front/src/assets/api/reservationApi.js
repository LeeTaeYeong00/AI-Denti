const API_BASE_URL = "http://localhost:8080";

export const getAvailableTimes = async (shopId, date) => {
    const response = await fetch(
        `${API_BASE_URL}/api/available-times/shop/${shopId}?date=${date}`
    );

    if (!response.ok) {
        throw new Error("예약 가능 시간을 불러오지 못했습니다.");
    }

    return response.json();
};

export const createReservation = async (
    userId,
    shopId,
    availableTimeId
) => {
    const response = await fetch(
        `${API_BASE_URL}/api/reservations`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                shopId,
                availableTimeId,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("예약 신청에 실패했습니다.");
    }

    return response.json();
};