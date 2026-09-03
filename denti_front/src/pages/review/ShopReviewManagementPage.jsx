import { useEffect, useState } from "react";

import { getMyRepairShop } from "../../api/repairShopAPI";
import ShopReviewSection from "../../components/review/ShopReviewSection";

// 정비소 소유자가 자신의 정비소에 작성된 리뷰를 관리하는 페이지이다.
function ShopReviewManagementPage() {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMyShop = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyRepairShop();

                setShop(data);
            } catch (error) {
                console.error(
                    "내 정비소 조회 실패:",
                    error
                );

                setError(
                    "내 정비소 정보를 불러오지 못했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        loadMyShop();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    정비소 정보를 불러오는 중입니다.
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="empty-state">
                    {error}
                </div>
            </div>
        );
    }

    if (!shop || shop.approvalStatus !== "APPROVED") {
        return (
            <div className="page">
                <div className="empty-state">
                    승인된 내 정비소가 있어야 리뷰를 관리할 수 있습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">
                    SHOP REVIEW
                </span>

                <h1 style={{ fontSize: 28 }}>
                    리뷰 관리
                </h1>

                <p style={{ marginTop: 6 }}>
                    {shop.name}
                </p>
            </div>

            <div className="card">
                <ShopReviewSection
                    shopId={shop.shopId}
                    replyManagement
                />
            </div>
        </div>
    );
}

export default ShopReviewManagementPage;