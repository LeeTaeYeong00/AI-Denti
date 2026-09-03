import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRepairShop, registerRepairShop } from "../api/repairShopAPI";

export default function MyShopPage() {
    const { loginUser } = useAuth();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", phone: "", description: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loginUser) return;
        loadShop();
    }, [loginUser]);

    const loadShop = async () => {
        try {
            const data = await getMyRepairShop();
            setShop(data);
        } catch (err) {
            setShop(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await registerRepairShop(form);
            alert("정비소 등록 신청이 완료되었습니다. 관리자 승인을 기다려주세요.");
            loadShop();
        } catch (err) {
            const message = err.response?.data?.message || "등록 신청에 실패했습니다.";
            setError(message);
        }
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page">
                <p style={{ textAlign: "center" }}>불러오는 중...</p>
            </div>
        );
    }

    // 정비소가 아직 없거나, 반려되어 재신청해야 하는 경우
    if (!shop || shop.approvalStatus === "REJECTED") {
        return (
            <div className="page" style={{ maxWidth: 480 }}>
                <div className="page-header">
                    <span className="eyebrow">MY SHOP</span>
                    <h1 style={{ fontSize: 28 }}>정비소 등록</h1>
                </div>

                {shop?.approvalStatus === "REJECTED" && (
                    <div className="card" style={{ borderColor: "var(--color-danger)", marginBottom: 16 }}>
                        <p className="form-error" style={{ marginBottom: 0 }}>
                            이전 등록 신청이 반려되었습니다. 정보를 확인하고 다시 신청해주세요.
                        </p>
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label className="field-label">정비소 이름</label>
                            <input
                                className="input"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field">
                            <label className="field-label">연락처</label>
                            <input
                                className="input"
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field">
                            <label className="field-label">소개</label>
                            <textarea
                                className="textarea"
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>
                        {error && <p className="form-error">{error}</p>}
                        <button type="submit" className="btn btn-primary btn-block">
                            등록 신청
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 승인 대기중
    if (shop.approvalStatus === "PENDING") {
        return (
            <div className="page" style={{ maxWidth: 480 }}>
                <div className="page-header">
                    <span className="eyebrow">MY SHOP</span>
                    <h1 style={{ fontSize: 28 }}>승인 대기중</h1>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: 8 }}>{shop.name}</h3>
                    <p style={{ fontSize: 14 }}>관리자 승인을 기다리고 있습니다. 승인이 완료되면 정비소 대시보드를 이용하실 수 있습니다.</p>
                </div>
            </div>
        );
    }

    // 승인 완료 -> 대시보드로 연결
    return (
        <div className="page" style={{ maxWidth: 480 }}>
            <div className="page-header">
                <span className="eyebrow">MY SHOP</span>
                <h1 style={{ fontSize: 28 }}>{shop.name}</h1>
                <p style={{ marginTop: 6 }}>{shop.phone}</p>
            </div>

            <div className="card">
                <p style={{ fontSize: 14, marginBottom: 16 }}>
                    승인된 정비소입니다. 예약과 리뷰를 관리할 수 있습니다.
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                    <Link
                        to="/shop-reservations"
                        className="btn btn-primary btn-block"
                        style={{ textDecoration: "none" }}
                    >
                        예약 관리 대시보드로 이동
                    </Link>

                    <Link
                        to="/my-shop/reviews"
                        className="btn btn-outline btn-block"
                        style={{ textDecoration: "none" }}
                    >
                        리뷰 및 답변 관리
                    </Link>
                </div>
            </div>
        </div>
    );
}