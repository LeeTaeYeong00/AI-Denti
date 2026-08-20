import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function MyReservationPage() {
    const { loginUser } = useAuth();

    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        if (!loginUser) return;

        const getMyReservations = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/reservations/user/${loginUser.userId}`,
                    {
                        withCredentials: true,
                    }
                );

                console.log("내 예약 목록:", response.data);

                setReservations(response.data);
            } catch (error) {
                console.error("내 예약 목록 조회 실패:", error);
            }
        };

        getMyReservations();
    }, [loginUser]);

    const cancelReservation = async (reservationId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/reservations/${reservationId}`,
                {
                    withCredentials: true,
                }
            );

            alert("예약이 취소되었습니다.");

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.reservationId === reservationId
                        ? { ...reservation, status: "CANCELLED" }
                        : reservation
                )
            );
        } catch (error) {
            console.error("예약 취소 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("예약 취소에 실패했습니다.");
        }
    };

    if (!loginUser) {
        return <div>로그인 후 이용해주세요.</div>;
    }

    return (
        <div>
            <h1>내 예약 내역</h1>

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
                            상태: {reservation.status}
                        </p>

                        {(reservation.status === "PENDING" ||
                            reservation.status === "CONFIRMED") && (
                            <button
                                onClick={() =>
                                    cancelReservation(reservation.reservationId)
                                }
                            >
                                예약 취소
                            </button>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default MyReservationPage;