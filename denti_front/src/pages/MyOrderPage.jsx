import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../api/orderAPI";

function MyOrderPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await getMyOrders();

                console.log("내 주문 목록:", data);

                setOrders(
                    data.filter((order) => order.status !== "CANCELLED")
                );
            } catch (error) {
                console.error("주문 목록 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    주문 내역을 불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">MY ORDERS</span>

                <h1 style={{ fontSize: 30 }}>
                    내 주문
                </h1>

                <p style={{ marginTop: 6 }}>
                    주문하신 상품의 내역을 확인할 수 있습니다.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    주문 내역이 없습니다.
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    {orders.map((order) => (
                        <div
                            key={order.orderId}
                            className="card"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                                navigate(
                                    `/orders/${order.orderId}`
                                )
                            }
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <span className="eyebrow">
                                        ORDER
                                    </span>

                                    <h2
                                        style={{
                                            marginTop: 6,
                                        }}
                                    >
                                        주문번호 #
                                        {order.orderId}
                                    </h2>
                                </div>

                                <strong>
                                    {order.status}
                                </strong>
                            </div>

                            <p
                                style={{
                                    marginTop: 12,
                                    color:
                                        "var(--color-ink-soft)",
                                }}
                            >
                                주문일: {order.createdDate}
                            </p>

                            <div
                                style={{
                                    marginTop: 16,
                                    paddingTop: 16,
                                    borderTop:
                                        "1px solid var(--color-border)",
                                }}
                            >
                                {order.items?.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                marginTop:
                                                    index === 0
                                                        ? 0
                                                        : 8,
                                            }}
                                        >
                                            <span>
                                                {
                                                    item.productName
                                                }{" "}
                                                ×{" "}
                                                {
                                                    item.quantity
                                                }
                                            </span>

                                            <span>
                                                {Number(
                                                    item.subtotal
                                                ).toLocaleString()}
                                                원
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: 16,
                                    textAlign: "right",
                                }}
                            >
                                <span>
                                    총 주문 금액
                                </span>

                                <strong
                                    style={{
                                        marginLeft: 8,
                                        fontSize: 20,
                                    }}
                                >
                                    {Number(
                                        order.totalPrice
                                    ).toLocaleString()}
                                    원
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrderPage;