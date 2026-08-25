import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRepairHistoriesByUser } from "../api/repairHistoryAPI";

function RepairHistoryPage() {
    const { loginUser } = useAuth();

    const [histories, setHistories] = useState([]);

    useEffect(() => {
        if (!loginUser) return;

        const loadHistories = async () => {
            try {
                const data = await getRepairHistoriesByUser(
                    loginUser.userId
                );

                console.log("내 정비 이력:", data);

                setHistories(data);
            } catch (error) {
                console.error("정비 이력 조회 실패:", error);

                if (error.response) {
                    console.log(
                        "서버 응답:",
                        error.response.data
                    );
                }

                setHistories([]);
            }
        };

        loadHistories();
    }, [loginUser]);

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
                <span className="eyebrow">MY GARAGE</span>
                <h1 style={{ fontSize: 28 }}>내 정비 이력</h1>
            </div>

            {histories.length === 0 ? (
                <div className="empty-state">정비 이력이 없습니다.</div>
            ) : (
                histories.map((history) => (
                    <div className="card" key={history.repairHistoryId}>
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
                                    정비 이력 #{history.repairHistoryId} · 예약 #{history.reservationId}
                                </p>
                                <h3 style={{ marginBottom: 4 }}>{history.description}</h3>
                                <p style={{ fontSize: 13 }}>정비일 {history.repairedAt}</p>
                            </div>

                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 700,
                                    fontSize: 18,
                                    color: "var(--color-ink)",
                                }}
                            >
                                {history.repairPrice?.toLocaleString()}원
                            </p>
                        </div>

                        <hr className="divider" />

                        <div
                            style={{
                                display: "flex",
                                gap: 24,
                                flexWrap: "wrap",
                                fontSize: 13,
                                color: "var(--color-ink-soft)",
                            }}
                        >
                            <span>차량 ID {history.vehicleId}</span>
                            <span>정비소 ID {history.shopId}</span>
                            <span>정비 항목 ID {history.itemId}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RepairHistoryPage;