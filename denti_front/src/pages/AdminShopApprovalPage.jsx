import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPendingShops, approveShop, rejectShop } from "../api/adminShopAPI";

export default function AdminShopApprovalPage() {
    const { loginUser } = useAuth();
    const [shops, setShops] = useState([]);

    useEffect(() => {
        loadShops();
    }, []);

    const loadShops = async () => {
        try {
            const data = await getPendingShops();
            setShops(data);
        } catch (err) {
            console.error("승인 대기 목록 조회 실패:", err);
        }
    };

    const handleApprove = async (shopId) => {
        await approveShop(shopId);
        loadShops();
    };

    const handleReject = async (shopId) => {
        if (!window.confirm("이 정비소를 반려하시겠습니까?")) return;
        await rejectShop(shopId);
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

            {shops.length === 0 ? (
                <div className="empty-state">승인 대기중인 정비소가 없습니다.</div>
            ) : (
                shops.map((shop) => (
                    <div className="card" key={shop.shopId}>
                        <h3 style={{ marginBottom: 4 }}>{shop.name}</h3>
                        <p style={{ fontSize: 14 }}>{shop.phone}</p>
                        <p style={{ fontSize: 13, marginTop: 8 }}>{shop.description}</p>
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
            )}
        </div>
    );
}