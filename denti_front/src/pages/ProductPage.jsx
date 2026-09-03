import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRepairShops } from "../api/repairShopAPI";
import {
    getProductsByShop,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../api/productAPI";

function ProductPage() {
    const { loginUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const shopIdParam = searchParams.get("shopId");

    const [shops, setShops] = useState([]);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");

    // 내 정비소 목록 조회
    useEffect(() => {
        if (!loginUser) return;

        const loadMyShops = async () => {
            try {
                const data = await getMyRepairShops();
                const approvedShops = data.filter((s) => s.approvalStatus === "APPROVED");

                console.log("내 정비소 목록:", approvedShops);

                setShops(approvedShops);

                if (shopIdParam) {
                    const found = approvedShops.find((s) => String(s.shopId) === shopIdParam);
                    setShop(found ?? null);
                } else if (approvedShops.length === 1) {
                    setShop(approvedShops[0]);
                }
            } catch (error) {
                console.error("내 정비소 조회 실패:", error);
            }
        };

        loadMyShops();
    }, [loginUser, shopIdParam]);

    // 상품 조회
    useEffect(() => {
        if (!shop) return;
        loadProducts();
    }, [shop]);

    const loadProducts = async () => {
        try {
            const data = await getProductsByShop(shop.shopId);
            console.log("내 상품:", data);
            setProducts(data);
        } catch (error) {
            console.error("상품 조회 실패:", error);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setEditingProductId(null);
        setShowForm(false);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if (!price) {
            alert("가격을 입력해주세요.");
            return;
        }
        if (stock === "") {
            alert("재고 수량을 입력해주세요.");
            return;
        }

        try {
            await createProduct(shop.shopId, {
                name,
                description,
                price: Number(price),
                stock: Number(stock),
            });
            alert("상품이 등록되었습니다.");
            resetForm();
            await loadProducts();
        } catch (error) {
            console.error("상품 등록 실패:", error);
            alert("상품 등록에 실패했습니다.");
        }
    };

    const handleEdit = (product) => {
        setEditingProductId(product.productId);
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price);
        setStock(product.stock);
        setShowForm(true);
    };

    const handleUpdate = async () => {
        if (!name.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }
        if (!price) {
            alert("가격을 입력해주세요.");
            return;
        }
        if (stock === "") {
            alert("재고 수량을 입력해주세요.");
            return;
        }

        try {
            await updateProduct(editingProductId, {
                name,
                description,
                price: Number(price),
                stock: Number(stock),
            });
            alert("상품이 수정되었습니다.");
            resetForm();
            await loadProducts();
        } catch (error) {
            console.error("상품 수정 실패:", error);
            alert("상품 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("이 상품의 판매를 중지하시겠습니까?")) return;

        try {
            await deleteProduct(productId);
            alert("상품 판매가 중지되었습니다.");
            await loadProducts();
        } catch (error) {
            console.error("상품 판매 중지 실패:", error);
            alert("상품 판매 중지에 실패했습니다.");
        }
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    // 정비소가 여러 개면 선택 화면 먼저 표시
    if (!shop) {
        if (shops.length === 0) {
            return (
                <div className="page">
                    <div className="empty-state">승인된 정비소가 없습니다.</div>
                </div>
            );
        }

        return (
            <div className="page" style={{ maxWidth: 480 }}>
                <div className="page-header">
                    <span className="eyebrow">SHOP PRODUCTS</span>
                    <h1 style={{ fontSize: 28 }}>정비소 선택</h1>
                    <p style={{ marginTop: 6 }}>상품을 관리할 정비소를 선택해주세요.</p>
                </div>

                {shops.map((s) => (
                    <button
                        key={s.shopId}
                        className="card"
                        style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                        onClick={() => setSearchParams({ shopId: s.shopId })}
                    >
                        <h3>{s.name}</h3>
                        <p style={{ fontSize: 14 }}>{s.phone}</p>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">SHOP PRODUCTS</span>
                <h1 style={{ fontSize: 28 }}>상품 관리</h1>
                <p style={{ marginTop: 6 }}>{shop.name}의 부품 및 용품을 관리합니다.</p>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ marginBottom: 4 }}>판매 상품</h2>
                        <p style={{ fontSize: 14 }}>부품 및 차량용품을 등록하고 관리할 수 있습니다.</p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        + 상품 등록
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card">
                    <h2 style={{ marginBottom: 16 }}>{editingProductId ? "상품 수정" : "상품 등록"}</h2>

                    <div className="field">
                        <label className="field-label">상품명</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="예: 엔진오일 5W-30"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">설명</label>
                        <textarea
                            className="input"
                            rows="4"
                            placeholder="상품에 대한 설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">가격</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="예: 50000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">재고</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="예: 10"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={editingProductId ? handleUpdate : handleCreate}>
                            {editingProductId ? "수정" : "등록"}
                        </button>
                        <button className="btn btn-ghost" onClick={resetForm}>
                            취소
                        </button>
                    </div>
                </div>
            )}

            {products.length === 0 ? (
                <div className="empty-state">등록된 상품이 없습니다.</div>
            ) : (
                products.map((product) => (
                    <div className="card" key={product.productId}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                            <div>
                                <h3>{product.name}</h3>
                                {product.description && (
                                    <p style={{ marginTop: 6, fontSize: 14, color: "var(--color-ink-soft)" }}>
                                        {product.description}
                                    </p>
                                )}
                                <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-ink-soft)" }}>
                                    재고 {product.stock}개
                                </p>
                            </div>
                            <strong>{Number(product.price).toLocaleString()}원</strong>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(product)}>
                                수정
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.productId)}>
                                판매 중지
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default ProductPage;