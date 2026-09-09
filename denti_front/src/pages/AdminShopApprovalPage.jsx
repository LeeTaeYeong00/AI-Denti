import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getPendingShops,
    approveShop,
    rejectShop,
    getAllShopApprovalHistory,
} from "../api/adminShopAPI";

const ACTION_LABEL = {
    APPROVED: "승인",
    REJECTED: "반려",
};

export default function AdminShopApprovalPage() {
    const { loginUser } = useAuth();
    const [tab, setTab] = useState("pending"); // "pending" | "history"

    const [shops, setShops] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (tab === "pending") {
            loadShops();
        } else {
            loadHistory();
        }
    }, [tab]);

    const loadShops = async () => {
        try {
            const data = await getPendingShops();
            setShops(data);
        } catch (err) {
            console.error("승인 대기 목록 조회 실패:", err);
        }
    };

    const loadHistory = async () => {
        try {
            const data = await getAllShopApprovalHistory();
            setHistory(data);
        } catch (err) {
            console.error("처리 이력 조회 실패:", err);
        }
    };

    const handleApprove = async (shopId) => {
        await approveShop(shopId);
        loadShops();
    };

    const handleReject = async (shopId) => {
        const reason = window.prompt("반려 사유를 입력해주세요.");
        if (!reason || !reason.trim()) {
            alert("반려 사유를 입력해야 합니다.");
            return;
        }
        await rejectShop(shopId, reason.trim());
        loadShops();
    };

    if (!loginUser || loginUser.role !== "ADMIN") {
        return (
            <div className="page">
                <div className="empty-state">관리자만 접근할 수 있습니다.</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">ADMIN</span>
                <h1 style={{ fontSize: 28 }}>정비소 승인 관리</h1>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button
                    className={`btn ${tab === "pending" ? "btn-primary" : "btn-outline"} btn-sm`}
                    onClick={() => setTab("pending")}
                >
                    승인 대기
                </button>
                <button
                    className={`btn ${tab === "history" ? "btn-primary" : "btn-outline"} btn-sm`}
                    onClick={() => setTab("history")}
                >
                    처리 이력
                </button>
            </div>

            {tab === "pending" && (
                shops.length === 0 ? (
                    <div className="empty-state">승인 대기중인 정비소가 없습니다.</div>
                ) : (
                    shops.map((shop) => (
                        <div className="card" key={shop.shopId}>
                            <h3 style={{ marginBottom: 4 }}>{shop.name}</h3>
                            <p style={{ fontSize: 14 }}>{shop.phone}</p>
                            <p style={{ fontSize: 13, marginTop: 8 }}>{shop.description}</p>

                            {shop.address && (
                                <p style={{ fontSize: 13, marginTop: 8, color: "var(--color-ink-soft)" }}>
                                    📍 {shop.address}
                                </p>
                            )}

                            {shop.businessDocUrl && (
                                <a
                                    href={`http://localhost:8080${shop.businessDocUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: "inline-block", marginTop: 8, fontSize: 13 }}
                                >
                                    📄 증빙 서류 확인
                                </a>
                            )}

                            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleApprove(shop.shopId)}>
                                    승인
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(shop.shopId)}>
                                    반려
                                </button>
                            </div>
                        </div>
                    ))
                )
            )}

            {tab === "history" && (
                history.length === 0 ? (
                    <div className="empty-state">처리 이력이 없습니다.</div>
                ) : (
                    history.map((item) => (
                        <div className="card" key={item.historyId}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ marginBottom: 4 }}>{item.shopName}</h3>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-faint)" }}>
                                        {new Date(item.processedAt).toLocaleString()}
                                    </p>
                                </div>
                                <span
                                    className={`badge ${item.action === "APPROVED" ? "badge-approved" : "badge-rejected"}`}
                                >
                                    {ACTION_LABEL[item.action] ?? item.action}
                                </span>
                            </div>

                            {item.reason && (
                                <p style={{ fontSize: 13, marginTop: 8, color: "var(--color-ink-soft)" }}>
                                    사유: {item.reason}
                                </p>
                            )}

                            {item.adminNickName && (
                                <p style={{ fontSize: 12, marginTop: 8, color: "var(--color-ink-faint)" }}>
                                    처리자: {item.adminNickName}
                                </p>
                            )}
                        </div>
                    ))
                )
            )}
        </div>
    );
}