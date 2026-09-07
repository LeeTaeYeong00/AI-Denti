import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRepairShops } from "../api/repairShopAPI";
import {
    getRepairShopHours,
    createRepairShopHour,
    updateRepairShopHour,
} from "../api/repairShopHourAPI";

const DAYS = [
    { value: "MONDAY", label: "월요일" },
    { value: "TUESDAY", label: "화요일" },
    { value: "WEDNESDAY", label: "수요일" },
    { value: "THURSDAY", label: "목요일" },
    { value: "FRIDAY", label: "금요일" },
    { value: "SATURDAY", label: "토요일" },
    { value: "SUNDAY", label: "일요일" },
];

export default function ManageShopHourPage() {
    const { loginUser } = useAuth();
    const [searchParams] = useSearchParams();
    const shopIdParam = searchParams.get("shopId");

    const [shops, setShops] = useState([]);
    const [shop, setShop] = useState(null);
    const [hours, setHours] = useState([]); // 서버에 이미 등록된 영업시간

    // 요일별 입력값: { MONDAY: { open: "09:00", close: "18:00", enabled: true }, ... }
    const [form, setForm] = useState(
        Object.fromEntries(DAYS.map((d) => [d.value, { open: "09:00", close: "18:00", enabled: false }]))
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loginUser) return;
        loadShops();
    }, [loginUser]);

    const loadShops = async () => {
        try {
            const data = await getMyRepairShops();
            const approvedShops = data.filter((s) => s.approvalStatus === "APPROVED");
            setShops(approvedShops);

            if (shopIdParam) {
                setShop(approvedShops.find((s) => String(s.shopId) === shopIdParam) ?? null);
            } else if (approvedShops.length === 1) {
                setShop(approvedShops[0]);
            }
        } catch (err) {
            console.error("정비소 조회 실패:", err);
        }
    };

    useEffect(() => {
        if (!shop) return;
        loadHours();
    }, [shop]);

    const loadHours = async () => {
        try {
            const data = await getRepairShopHours(shop.shopId);
            setHours(data);

            // 기존 등록된 값을 폼에 반영
            setForm((prev) => {
                const next = { ...prev };
                DAYS.forEach((d) => {
                    const existing = data.find((h) => h.dayOfWeek === d.value);
                    next[d.value] = existing
                        ? { open: existing.openTime.slice(0, 5), close: existing.closeTime.slice(0, 5), enabled: true }
                        : { open: "09:00", close: "18:00", enabled: false };
                });
                return next;
            });
        } catch (err) {
            console.error("영업시간 조회 실패:", err);
        }
    };

    const handleFieldChange = (day, field, value) => {
        setForm((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const handleToggleDay = (day) => {
        setForm((prev) => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const d of DAYS) {
                const dayForm = form[d.value];
                const existing = hours.find((h) => h.dayOfWeek === d.value);

                if (!dayForm.enabled) {
                    continue; // 비활성 요일은 건드리지 않음 (삭제는 별도 처리 필요시 추가)
                }

                const payload = {
                    dayOfWeek: d.value,
                    openTime: dayForm.open,
                    closeTime: dayForm.close,
                };

                if (existing) {
                    await updateRepairShopHour(shop.shopId, existing.hourId, payload);
                } else {
                    await createRepairShopHour(shop.shopId, payload);
                }
            }
            alert("영업시간이 저장되었습니다.");
            loadHours();
        } catch (err) {
            alert(err.response?.data || "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

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
                    <span className="eyebrow">SHOP</span>
                    <h1 style={{ fontSize: 28 }}>정비소 선택</h1>
                </div>
                {shops.map((s) => (
                    <button
                        key={s.shopId}
                        className="card"
                        style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                        onClick={() => setShop(s)}
                    >
                        <h3>{s.name}</h3>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: 560 }}>
            <div className="page-header">
                <span className="eyebrow">SHOP DASHBOARD</span>
                <h1 style={{ fontSize: 28 }}>영업시간 관리</h1>
                <p style={{ marginTop: 6 }}>{shop.name}</p>
            </div>

            <div className="card">
                {DAYS.map((d) => (
                    <div
                        key={d.value}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 0",
                            borderBottom: "1px solid var(--color-line)",
                        }}
                    >
                        <label style={{ display: "flex", alignItems: "center", gap: 6, width: 90, flex: "none" }}>
                            <input
                                type="checkbox"
                                checked={form[d.value].enabled}
                                onChange={() => handleToggleDay(d.value)}
                            />
                            {d.label}
                        </label>

                        {form[d.value].enabled ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="time"
                                    className="input"
                                    style={{ width: 130 }}
                                    value={form[d.value].open}
                                    onChange={(e) => handleFieldChange(d.value, "open", e.target.value)}
                                />
                                <span>~</span>
                                <input
                                    type="time"
                                    className="input"
                                    style={{ width: 130 }}
                                    value={form[d.value].close}
                                    onChange={(e) => handleFieldChange(d.value, "close", e.target.value)}
                                />
                            </div>
                        ) : (
                            <span style={{ fontSize: 13, color: "var(--color-ink-faint)" }}>휴무</span>
                        )}
                    </div>
                ))}

                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장하기"}
                </button>
            </div>
        </div>
    );
}