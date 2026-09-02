import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/productAPI";
import { createOrder } from "../api/orderAPI";

function OrderPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await getProduct(productId);
                setProduct(data);
            } catch (error) {
                console.error("상품 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    const handleOrder = async () => {
        if (!product) return;

        try {
            const data = await createOrder({
                items: [
                    {
                        productId: Number(productId),
                        quantity: quantity,
                    },
                ],
            });

            console.log("주문 완료:", data);

            alert("주문이 완료되었습니다.");

            navigate(`/orders/${data.orderId}`);
        } catch (error) {
            console.error("주문 실패:", error);
            alert(
                error.response?.data?.message ||
                "주문에 실패했습니다."
            );
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    상품 정보를 불러오는 중...
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page">
                <div className="empty-state">
                    상품을 찾을 수 없습니다.
                </div>
            </div>
        );
    }

    const totalPrice =
        Number(product.price) * quantity;

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">ORDER</span>

                <h1 style={{ fontSize: 30 }}>
                    주문하기
                </h1>

                <p style={{ marginTop: 6 }}>
                    주문할 상품과 수량을 확인해주세요.
                </p>
            </div>

            <div className="card">
                <h2>{product.name}</h2>

                <p
                    style={{
                        marginTop: 8,
                        color: "var(--color-ink-soft)",
                    }}
                >
                    {product.description}
                </p>

                <p style={{ marginTop: 12 }}>
                    가격:{" "}
                    <strong>
                        {Number(product.price).toLocaleString()}원
                    </strong>
                </p>

                <div
                    className="field"
                    style={{ marginTop: 20 }}
                >
                    <label className="field-label">
                        주문 수량
                    </label>

                    <input
                        className="input"
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(Number(e.target.value))
                        }
                    />
                </div>

                <div
                    style={{
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop:
                            "1px solid var(--color-border)",
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
                        {totalPrice.toLocaleString()}원
                    </strong>
                </div>
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
                    onClick={handleOrder}
                >
                    주문하기
                </button>

                <button
                    className="btn btn-ghost"
                    onClick={() =>
                        navigate(`/products/${productId}`)
                    }
                >
                    취소
                </button>
            </div>
        </div>
    );
}

export default OrderPage;