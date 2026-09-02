import { useEffect, useMemo, useState } from "react";
import { getAllRepairItems } from "../api/repairItemAPI";

function RepairItemListPage() {
    const [items, setItems] = useState([]);
    const [selectedName, setSelectedName] = useState(null);
    const [loading, setLoading] = useState(true);

    // 전체 활성화 정비상품 조회
    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await getAllRepairItems();

                console.log("전체 정비상품:", data);

                setItems(data);
            } catch (error) {
                console.error("전체 정비상품 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    // 정비 항목 이름별 그룹화
    const groupedItems = useMemo(() => {
        const groups = {};

        items.forEach((item) => {
            if (!groups[item.name]) {
                groups[item.name] = [];
            }

            groups[item.name].push(item);
        });

        return groups;
    }, [items]);

    if (loading) {
        return (
            <div className="page">
                <div className="empty-state">
                    정비상품을 불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">REPAIR ITEMS</span>
                <h1 style={{ fontSize: 30 }}>
                    정비상품
                </h1>
                <p style={{ marginTop: 6 }}>
                    원하는 정비 항목을 선택하고 정비소별 가격을 비교해보세요.
                </p>
            </div>

            {Object.keys(groupedItems).length === 0 ? (
                <div className="empty-state">
                    등록된 정비상품이 없습니다.
                </div>
            ) : (
                <>
                    {/* 정비 항목 메뉴 */}
                    <div className="card">
                        <h2 style={{ marginBottom: 16 }}>
                            정비 항목
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: 12,
                            }}
                        >
                            {Object.keys(groupedItems).map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={`select-card ${
                                        selectedName === name
                                            ? "select-card--selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedName(name)
                                    }
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
                                            {groupedItems[name].length}개 정비소
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 선택한 정비 항목 */}
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
                                        REPAIR ITEM
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
                                    {groupedItems[selectedName].length}개 정비소
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                }}
                            >
                                {groupedItems[selectedName]
                                    .sort((a, b) => a.price - b.price)
                                    .map((item) => (
                                        <div
                                            key={item.itemId}
                                            className="select-card"
                                            style={{
                                                cursor: "default",
                                            }}
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
                                                        {item.shop?.name ||
                                                            "정비소"}
                                                    </p>

                                                    {item.description && (
                                                        <p
                                                            style={{
                                                                marginTop: 6,
                                                                fontSize: 13,
                                                                color: "var(--color-ink-soft)",
                                                            }}
                                                        >
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <strong
                                                    style={{
                                                        fontSize: 17,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {Number(
                                                        item.price
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

export default RepairItemListPage;