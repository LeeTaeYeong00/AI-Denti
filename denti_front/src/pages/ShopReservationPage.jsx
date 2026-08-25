import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = {
    PENDING: "대기중",
    CONFIRMED: "승인됨",
    IN_PROGRESS: "정비중",
    COMPLETED: "완료",
    REJECTED: "거절됨",
    CANCELLED: "취소됨",
};

function StatusBadge({ status }) {
    return (
        <span className={`badge badge-${status.toLowerCase()}`}>
            {STATUS_LABEL[status] ?? status}
        </span>
    );
}

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
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">SHOP DASHBOARD</span>
                <h1 style={{ fontSize: 28 }}>정비소 예약 관리</h1>
            </div>

            {reservations.length === 0 ? (
                <div className="empty-state">예약 내역이 없습니다.</div>
            ) : (
                reservations.map((reservation) => (
                    <div className="card" key={reservation.reservationId}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 12,
                                        color: "var(--color-ink-faint)",
                                        marginBottom: 6,
                                    }}
                                >
                                    예약 #{reservation.reservationId} · 사용자 #{reservation.userId}
                                </p>
                                <h3>
                                    {reservation.availableDate} · {reservation.availableTime}
                                </h3>
                            </div>

                            <StatusBadge status={reservation.status} />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                            {reservation.status === "PENDING" && (
                                <>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() =>
                                            updateStatus(reservation.reservationId, "CONFIRMED")
                                        }
                                    >
                                        승인
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            updateStatus(reservation.reservationId, "REJECTED")
                                        }
                                    >
                                        거절
                                    </button>
                                </>
                            )}

                            {reservation.status === "CONFIRMED" && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                        updateStatus(reservation.reservationId, "IN_PROGRESS")
                                    }
                                >
                                    정비 시작
                                </button>
                            )}

                            {reservation.status === "IN_PROGRESS" && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        updateStatus(reservation.reservationId, "COMPLETED")
                                    }
                                >
                                    정비 완료
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default ShopReservationPage;