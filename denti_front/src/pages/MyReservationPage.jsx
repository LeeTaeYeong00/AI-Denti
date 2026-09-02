import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReservations, cancelReservation } from "../api/reservationAPI";
import { getReservationHistories } from "../api/reservationHistoryAPI";
import { useNavigate } from "react-router-dom";
import { getMyReviewedReservationIds } from "../api/reviewApi";

const STATUS_LABEL = {
    PENDING: "대기중",
    CONFIRMED: "승인됨",
    IN_PROGRESS: "정비중",
    COMPLETED: "완료",
    CANCELLED: "취소됨",
    REJECTED: "거절됨",
};

function StatusBadge({ status }) {
    const className = `badge badge-${status.toLowerCase()}`;
    return <span className={className}>{STATUS_LABEL[status] ?? status}</span>;
}

function MyReservationPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [histories, setHistories] = useState({});
    const [openHistory, setOpenHistory] = useState(null);
    const [reviewedReservationIds, setReviewedReservationIds] = useState(null);

    useEffect(() => {
        if (!loginUser) return;

        const loadMyReservations = async () => {
            try {
                const data = await getMyReservations(loginUser.userId);

                console.log("내 예약 목록:", data);

                setReservations(data);
            } catch (error) {
                console.error("내 예약 목록 조회 실패:", error);
            }
        };

        loadMyReservations();
    }, [loginUser]);

    // 현재 사용자가 리뷰를 작성한 예약 번호를 조회한다.
    useEffect(() => {
        if (!loginUser) {
            setReviewedReservationIds(null);
            return;
        }

        const loadReviewedReservationIds = async () => {
            try {
                const response = await getMyReviewedReservationIds();

                setReviewedReservationIds(
                    new Set(response.data.map(Number))
                );
            } catch (error) {
                console.error("리뷰 작성 여부 조회 실패:", error);
                setReviewedReservationIds(null);
            }
        };

        loadReviewedReservationIds();
    }, [loginUser]);

    const handleCancelReservation = async (reservationId) => {
        try {
            await cancelReservation(reservationId);

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

    // 예약 상태 변경 이력 조회
    const loadReservationHistory = async (reservationId) => {
        // 이미 열려 있으면 닫기
        if (openHistory === reservationId) {
            setOpenHistory(null);
            return;
        }

        try {
            const data = await getReservationHistories(reservationId);

            console.log("예약 상태 변경 이력:", reservationId, data);

            setHistories((prev) => ({
                ...prev,
                [reservationId]: data,
            }));

            setOpenHistory(reservationId);
        } catch (error) {
            console.error("예약 상태 변경 이력 조회 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("예약 상태 이력을 불러오지 못했습니다.");
        }
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">예약 관리</span>
                <h1 style={{ fontSize: 28 }}>내 예약 내역</h1>
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
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-faint)", marginBottom: 6 }}>
                                    예약 번호 #{reservation.reservationId}
                                </p>
                                <h3 style={{ marginBottom: 4 }}>
                                    {reservation.availableDate} · {reservation.availableTime}
                                </h3>
                            </div>

                            <StatusBadge status={reservation.status} />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                            {(reservation.status === "PENDING" ||
                                reservation.status === "CONFIRMED") && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleCancelReservation(reservation.reservationId)}
                                >
                                예약 취소 
                                </button> 
                            )} 

                            {/* 완료된 예약에만 리뷰 버튼을 표시한다. */} 
                            {reservation.status === "COMPLETED" && 
                                reviewedReservationIds !== null && 
                                (reviewedReservationIds.has(Number(reservation.reservationId)) ? ( 
                                    <button 
                                        type="button" 
                                        className="btn btn-outline btn-sm" 
                                        disabled 
                                    > 
                                        리뷰 작성 완료 
                                    </button> 
                                ) : ( 
                                    <button 
                                        type="button" 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => 
                                            navigate(`/reviews/write/${reservation.reservationId}`) 
                                        } 
                                    > 
                                        리뷰 작성 
                                    </button> 
                                ))} 
 
                            <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => loadReservationHistory(reservation.reservationId)} 
                            >
                                {openHistory === reservation.reservationId
                                    ? "상태 이력 닫기"
                                    : "상태 이력 보기"}
                            </button>
                        </div>

                        {/* 상태 변경 이력 */}
                        {openHistory === reservation.reservationId && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background: "var(--color-surface)",
                                    borderRadius: "var(--radius-sm)",
                                }}
                            >
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 10 }}>
                                    상태 변경 이력
                                </p>

                                {!histories[reservation.reservationId] ||
                                histories[reservation.reservationId].length === 0 ? (
                                    <p style={{ fontSize: 14 }}>상태 변경 이력이 없습니다.</p>
                                ) : (
                                    histories[reservation.reservationId].map((history) => (
                                        <div
                                            key={history.historyId}
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                alignItems: "center",
                                                fontSize: 13,
                                                marginBottom: 6,
                                            }}
                                        >
                                            <StatusBadge status={history.status} />
                                            <span style={{ color: "var(--color-ink-faint)", fontFamily: "var(--font-mono)" }}>
                                                {history.changedAt}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default MyReservationPage;
