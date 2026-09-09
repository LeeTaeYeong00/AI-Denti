import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/productAPI";

function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await getProduct(productId);

                console.log("상품 상세:", data);

                setProduct(data);
            } catch (error) {
                console.error("상품 상세 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

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

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">PRODUCT DETAIL</span>

                <h1 style={{ fontSize: 30 }}>
                    {product.name}
                </h1>

                <p style={{ marginTop: 6 }}>
                    판매 상품 상세 정보
                </p>
            </div>

            <div className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 24,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <span className="eyebrow">
                            SELLER
                        </span>

                        <h2 style={{ marginTop: 6 }}>
                            {product.shop?.name || "판매 정비소"}
                        </h2>

                        {product.description && (
                            <p
                                style={{
                                    marginTop: 12,
                                    lineHeight: 1.7,
                                    color: "var(--color-ink-soft)",
                                }}
                            >
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div
                        style={{
                            textAlign: "right",
                            minWidth: 140,
                        }}
                    >
                        <p
                            style={{
                                fontSize: 13,
                                color: "var(--color-ink-soft)",
                            }}
                        >
                            판매 가격
                        </p>

                        <strong
                            style={{
                                display: "block",
                                marginTop: 4,
                                fontSize: 24,
                            }}
                        >
                            {Number(
                                product.price
                            ).toLocaleString()}
                            원
                        </strong>

                        <p
                            style={{
                                marginTop: 8,
                                fontSize: 14,
                                color: "var(--color-ink-soft)",
                            }}
                        >
                            재고 {product.stock}개
                        </p>
                    </div>
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
                    disabled={product.stock <= 0}
                    onClick={() => {
                        navigate(`/products/${product.productId}/order`);
                    }}
                >
                    {product.stock > 0
                        ? "구매하기"
                        : "품절"}
                </button>

                <button
                    className="btn btn-ghost"
                    onClick={() => navigate("/product-list")}
                >
                    상품 목록
                </button>
            </div>
        </div>
    );
}

export default ProductDetailPage;