import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRepairShops } from "../api/repairShopAPI";
import {
    getRepairItemsByShop,
    createRepairItem,
    updateRepairItem,
    deleteRepairItem,
} from "../api/repairItemAPI";

function RepairItemPage() {
    const { loginUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const shopIdParam = searchParams.get("shopId");

    const [shops, setShops] = useState([]);
    const [shop, setShop] = useState(null);
    const [items, setItems] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    // 내 정비소 목록 조회
    useEffect(() => {
        if (!loginUser) return;

        const loadMyShops = async () => {
            try {
                const data = await getMyRepairShops();
                const approvedShops = data.filter((s) => s.approvalStatus === "APPROVED");

                console.log("내 정비소 목록:", approvedShops);

                setShops(approvedShops);

                // URL에 shopId가 있으면 그 정비소 선택, 없고 1개뿐이면 자동 선택
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

    // 판매 품목 조회
    useEffect(() => {
        if (!shop) return;
        loadItems();
    }, [shop]);

    const loadItems = async () => {
        try {
            const data = await getRepairItemsByShop(shop.shopId);
            console.log("판매 품목:", data);
            setItems(data);
        } catch (error) {
            console.error("판매 품목 조회 실패:", error);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setEditingItemId(null);
        setShowForm(false);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            alert("품목명을 입력해주세요.");
            return;
        }
        if (!price) {
            alert("가격을 입력해주세요.");
            return;
        }

        try {
            await createRepairItem(shop.shopId, {
                name,
                description,
                price: Number(price),
            });
            alert("판매 품목이 등록되었습니다.");
            resetForm();
            await loadItems();
        } catch (error) {
            console.error("판매 품목 등록 실패:", error);
            alert("판매 품목 등록에 실패했습니다.");
        }
    };

    const handleEdit = (item) => {
        setEditingItemId(item.itemId);
        setName(item.name);
        setDescription(item.description || "");
        setPrice(item.price);
        setShowForm(true);
    };

    const handleUpdate = async () => {
        if (!name.trim()) {
            alert("품목명을 입력해주세요.");
            return;
        }
        if (!price) {
            alert("가격을 입력해주세요.");
            return;
        }

        try {
            await updateRepairItem(editingItemId, {
                name,
                description,
                price: Number(price),
            });
            alert("판매 품목이 수정되었습니다.");
            resetForm();
            await loadItems();
        } catch (error) {
            console.error("판매 품목 수정 실패:", error);
            alert("판매 품목 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("이 판매 품목을 판매 중지하시겠습니까?")) return;

        try {
            await deleteRepairItem(itemId);
            alert("판매 품목이 판매 중지되었습니다.");
            await loadItems();
        } catch (error) {
            console.error("판매 품목 삭제 실패:", error);
            alert("판매 품목 판매 중지에 실패했습니다.");
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
                    <p style={{ marginTop: 6 }}>판매 품목을 관리할 정비소를 선택해주세요.</p>
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
                <h1 style={{ fontSize: 28 }}>판매 품목 관리</h1>
                <p style={{ marginTop: 6 }}>{shop.name}의 판매 품목을 관리합니다.</p>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ marginBottom: 4 }}>판매 품목</h2>
                        <p style={{ fontSize: 14 }}>정비소에서 판매하는 품목을 등록하고 관리할 수 있습니다.</p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        + 품목 등록
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card">
                    <h2 style={{ marginBottom: 16 }}>{editingItemId ? "판매 품목 수정" : "판매 품목 등록"}</h2>

                    <div className="field">
                        <label className="field-label">품목명</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="예: 엔진오일 교환"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">설명</label>
                        <textarea
                            className="input"
                            rows="4"
                            placeholder="판매 품목에 대한 설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">가격</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="예: 30000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={editingItemId ? handleUpdate : handleCreate}>
                            {editingItemId ? "수정" : "등록"}
                        </button>
                        <button className="btn btn-ghost" onClick={resetForm}>
                            취소
                        </button>
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <div className="empty-state">등록된 판매 품목이 없습니다.</div>
            ) : (
                items.map((item) => (
                    <div className="card" key={item.itemId}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                            <div>
                                <h3>{item.name}</h3>
                                {item.description && (
                                    <p style={{ marginTop: 6, fontSize: 14, color: "var(--color-ink-soft)" }}>
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <strong>{Number(item.price).toLocaleString()}원</strong>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}>
                                수정
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.itemId)}>
                                판매 중지
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RepairItemPage;