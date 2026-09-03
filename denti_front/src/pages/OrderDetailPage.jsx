import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, cancelOrder } from "../api/orderAPI";

function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await getOrder(orderId);

                console.log("주문 상세:", data);

                setOrder(data);
            } catch (error) {
                console.error("주문 조회 실패:", error);

                alert(
                    error.response?.data?.message ||
                    "주문 정보를 불러오지 못했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!window.confirm("주문을 취소하시겠습니까?")) {
            return;
        }

        try {
            const data = await cancelOrder(orderId);

            console.log("주문 취소 완료:", data);

            alert("주문이 취소되었습니다.");

            setOrder(data);
        } catch (error) {
            console.error("주문 취소 실패:", error);

            alert(
                error.response?.data?.message ||
                "주문 취소에 실패했습니다."
            );
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    주문 정보를 불러오는 중...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="page">
                <div className="empty-state">
                    주문 정보를 찾을 수 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">ORDER</span>

                <h1 style={{ fontSize: 30 }}>
                    주문 상세
                </h1>

                <p style={{ marginTop: 6 }}>
                    주문하신 상품의 정보를 확인할 수 있습니다.
                </p>
            </div>

            <div className="card">
                <h2>주문번호 #{order.orderId}</h2>

                <p style={{ marginTop: 12 }}>
                    주문 상태:{" "}
                    <strong>{order.status}</strong>
                </p>

                <p style={{ marginTop: 8 }}>
                    주문일: {order.createdDate}
                </p>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h2>주문 상품</h2>

                {order.items?.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop:
                                "1px solid var(--color-border)",
                        }}
                    >
                        <h3>{item.productName}</h3>

                        <p style={{ marginTop: 8 }}>
                            수량: {item.quantity}개
                        </p>

                        <p style={{ marginTop: 8 }}>
                            가격:{" "}
                            {Number(
                                item.price
                            ).toLocaleString()}
                            원
                        </p>

                        <p style={{ marginTop: 8 }}>
                            소계:{" "}
                            {Number(
                                item.subtotal
                            ).toLocaleString()}
                            원
                        </p>
                    </div>
                ))}
            </div>

            <div
                className="card"
                style={{
                    marginTop: 16,
                    textAlign: "right",
                }}
            >
                <p>총 주문 금액</p>

                <strong
                    style={{
                        display: "block",
                        marginTop: 6,
                        fontSize: 24,
                    }}
                >
                    {Number(
                        order.totalPrice
                    ).toLocaleString()}
                    원
                </strong>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 16,
                }}
            >
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/product-list")}
                >
                    상품 목록
                </button>

                {order.status === "PENDING" && (
                    <button
                        className="btn btn-ghost"
                        onClick={handleCancelOrder}
                    >
                        주문 취소
                    </button>
                )}

                <button
                    className="btn btn-ghost"
                    onClick={() => navigate("/")}
                >
                    홈으로
                </button>
            </div>
        </div>
    );
}

export default OrderDetailPage;