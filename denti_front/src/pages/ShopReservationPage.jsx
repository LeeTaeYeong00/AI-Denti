import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getShopReservations, updateReservationStatus } from "../api/reservationAPI";

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
    const [searchParams] = useSearchParams();
    const shopId = searchParams.get("shopId");

    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        if (!shopId) return;

        const loadReservations = async () => {
            try {
                const data = await getShopReservations(shopId);
                console.log("정비소 예약 목록:", data);
                setReservations(data);
            } catch (error) {
                console.error("정비소 예약 목록 조회 실패:", error);
            }
        };

        loadReservations();
    }, [shopId]);

    const updateStatus = async (reservationId, status) => {
        try {
            const data = await updateReservationStatus(reservationId, status);

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.reservationId === reservationId ? data : reservation
                )
            );

            if (status === "CONFIRMED") alert("예약이 승인되었습니다.");
            else if (status === "REJECTED") alert("예약이 거절되었습니다.");
            else if (status === "IN_PROGRESS") alert("정비가 시작되었습니다.");
            else if (status === "COMPLETED") alert("정비가 완료되었습니다.");
        } catch (error) {
            console.error("예약 상태 변경 실패:", error);
            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }
            alert("예약 상태 변경에 실패했습니다.");
        }
    };

    if (!shopId) {
        return (
            <div className="page">
                <div className="empty-state">
                    <a href="/my-shop">내 정비소</a>에서 관리할 정비소를 선택해주세요.
                </div>
            </div>
        );
    }

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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                            <div>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-faint)", marginBottom: 6 }}>
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
                                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(reservation.reservationId, "CONFIRMED")}>
                                        승인
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(reservation.reservationId, "REJECTED")}>
                                        거절
                                    </button>
                                </>
                            )}
                            {reservation.status === "CONFIRMED" && (
                                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(reservation.reservationId, "IN_PROGRESS")}>
                                    정비 시작
                                </button>
                            )}
                            {reservation.status === "IN_PROGRESS" && (
                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(reservation.reservationId, "COMPLETED")}>
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