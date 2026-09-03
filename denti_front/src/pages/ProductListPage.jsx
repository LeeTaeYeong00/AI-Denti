import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../api/productAPI";
import { useNavigate } from "react-router-dom";

function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [selectedName, setSelectedName] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 전체 판매 상품 조회
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getAllProducts();

                console.log("전체 상품:", data);

                setProducts(data);
            } catch (error) {
                console.error("전체 상품 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // 상품명별 그룹화
    const groupedProducts = useMemo(() => {
        const groups = {};

        products.forEach((product) => {
            if (!groups[product.name]) {
                groups[product.name] = [];
            }

            groups[product.name].push(product);
        });

        return groups;
    }, [products]);

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    상품을 불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">PARTS & PRODUCTS</span>

                <h1 style={{ fontSize: 30 }}>
                    부품·용품
                </h1>

                <p style={{ marginTop: 6 }}>
                    정비소에서 판매하는 부품과 차량용품을 비교해보세요.
                </p>
            </div>

            {Object.keys(groupedProducts).length === 0 ? (
                <div className="empty-state">
                    등록된 상품이 없습니다.
                </div>
            ) : (
                <>
                    {/* 상품 메뉴 */}
                    <div className="card">
                        <h2 style={{ marginBottom: 16 }}>
                            상품 목록
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: 12,
                            }}
                        >
                            {Object.keys(groupedProducts).map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={`select-card ${
                                        selectedName === name
                                            ? "select-card--selected"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedName(name)}
                                    style={{
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    <p className="select-card__title">
                                        {name}
                                    </p>

                                    <div className="select-card__meta">
                                        <span>
                                            {groupedProducts[name].length}개 판매처
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 선택한 상품 */}
                    {selectedName && (
                        <div className="card">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <span className="eyebrow">
                                        PRODUCT
                                    </span>

                                    <h2 style={{ marginTop: 4 }}>
                                        {selectedName}
                                    </h2>
                                </div>

                                <span
                                    style={{
                                        fontSize: 14,
                                        color: "var(--color-ink-soft)",
                                    }}
                                >
                                    {groupedProducts[selectedName].length}개 판매처
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                }}
                            >
                                {groupedProducts[selectedName]
                                    .slice()
                                    .sort((a, b) => a.price - b.price)
                                    .map((product) => (
                                        <div
                                            key={product.productId}
                                            className="select-card"
                                            style={{
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                navigate(`/products/${product.productId}`)
                                            }
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    gap: 16,
                                                }}
                                            >
                                                <div>
                                                    <p className="select-card__title">
                                                        {product.shop?.name ||
                                                            "판매 정비소"}
                                                    </p>

                                                    {product.description && (
                                                        <p
                                                            style={{
                                                                marginTop: 6,
                                                                fontSize: 13,
                                                                color: "var(--color-ink-soft)",
                                                            }}
                                                        >
                                                            {product.description}
                                                        </p>
                                                    )}

                                                    <p
                                                        style={{
                                                            marginTop: 6,
                                                            fontSize: 13,
                                                            color: "var(--color-ink-soft)",
                                                        }}
                                                    >
                                                        재고 {product.stock}개
                                                    </p>
                                                </div>

                                                <strong
                                                    style={{
                                                        fontSize: 17,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString()}
                                                    원
                                                </strong>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductListPage;