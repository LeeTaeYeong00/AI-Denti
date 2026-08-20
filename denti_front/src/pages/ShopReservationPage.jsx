import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ShopReservationPage() {
    const { loginUser } = useAuth();

    const [shopId, setShopId] = useState(null);

    useEffect(() => {
        if (!loginUser) return;

        const getMyRepairShop = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/repair-shops/my",
                    {
                        withCredentials: true,
                    }
                );

                console.log("내 정비소:", response.data);

                setShopId(response.data.shopId);
            } catch (error) {
                console.error("내 정비소 조회 실패:", error);
            }
        };

        getMyRepairShop();
    }, [loginUser]);

    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        if (!shopId) return;

        const getReservations = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/reservations/shop/${shopId}`,
                    {
                        withCredentials: true,
                    }
                );

                console.log("정비소 예약 목록:", response.data);

                setReservations(response.data);
            } catch (error) {
                console.error("정비소 예약 목록 조회 실패:", error);
            }
        };

        getReservations();
    }, [shopId]);

    const updateStatus = async (reservationId, status) => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/reservations/${reservationId}/status`,
                null,
                {
                    params: {
                        status: status,
                    },
                    withCredentials: true,
                }
            );

            console.log("예약 상태 변경:", response.data);

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.reservationId === reservationId
                        ? response.data
                        : reservation
                )
            );

            if (status === "CONFIRMED") {
                alert("예약이 승인되었습니다.");
            } else if (status === "REJECTED") {
                alert("예약이 거절되었습니다.");
            } else if (status === "IN_PROGRESS") {
                alert("정비가 시작되었습니다.");
            } else if (status === "COMPLETED") {
                alert("정비가 완료되었습니다.");
            }
        } catch (error) {
            console.error("예약 상태 변경 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("예약 상태 변경에 실패했습니다.");
        }
    };

    return (
        <div>
            <h1>정비소 예약 관리</h1>

            {reservations.length === 0 ? (
                <p>예약 내역이 없습니다.</p>
            ) : (
                reservations.map((reservation) => (
                    <div key={reservation.reservationId}>
                        <p>
                            예약 번호: {reservation.reservationId}
                        </p>

                        <p>
                            날짜: {reservation.availableDate}
                        </p>

                        <p>
                            시간: {reservation.availableTime}
                        </p>

                        <p>
                            사용자 번호: {reservation.userId}
                        </p>

                        <p>
                            상태: {reservation.status}
                        </p>

                        {reservation.status === "PENDING" && (
                            <div>
                                <button
                                    onClick={() =>
                                        updateStatus(
                                            reservation.reservationId,
                                            "CONFIRMED"
                                        )
                                    }
                                >
                                    승인
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            reservation.reservationId,
                                            "REJECTED"
                                        )
                                    }
                                >
                                    거절
                                </button>
                            </div>
                        )}

                        {reservation.status === "CONFIRMED" && (
                            <button
                                onClick={() =>
                                    updateStatus(
                                        reservation.reservationId,
                                        "IN_PROGRESS"
                                    )
                                }
                            >
                                정비 시작
                            </button>
                        )}

                        {reservation.status === "IN_PROGRESS" && (
                            <button
                                onClick={() =>
                                    updateStatus(
                                        reservation.reservationId,
                                        "COMPLETED"
                                    )
                                }
                            >
                                정비 완료
                            </button>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default ShopReservationPage;