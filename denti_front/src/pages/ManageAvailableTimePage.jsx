import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getMyRepairShops,
} from "../api/repairShopAPI";
import {
    getAvailableTimes,
    createAvailableTime,
    createAvailableTimesBulk,
    updateAvailableTimeCapacity,
    deleteAvailableTime,
} from "../api/reservationAPI";

const DAYS = [
    { value: "MONDAY", label: "월" },
    { value: "TUESDAY", label: "화" },
    { value: "WEDNESDAY", label: "수" },
    { value: "THURSDAY", label: "목" },
    { value: "FRIDAY", label: "금" },
    { value: "SATURDAY", label: "토" },
    { value: "SUNDAY", label: "일" },
];

export default function ManageAvailableTimePage() {
    const { loginUser } = useAuth();
    const [searchParams] = useSearchParams();
    const shopIdParam = searchParams.get("shopId");

    const [shops, setShops] = useState([]);
    const [shop, setShop] = useState(null);

    const [selectedDate, setSelectedDate] = useState("");
    const [times, setTimes] = useState([]);

    // 개별 등록 폼
    const [singleTime, setSingleTime] = useState("");
    const [singleCapacity, setSingleCapacity] = useState(1);

    // 자동 생성 폼
    const [bulkStart, setBulkStart] = useState("");
    const [bulkEnd, setBulkEnd] = useState("");
    const [bulkDays, setBulkDays] = useState([]);
    const [bulkTimesText, setBulkTimesText] = useState("09:00, 10:00, 11:00");
    const [bulkCapacity, setBulkCapacity] = useState(1);
    const [showBulkForm, setShowBulkForm] = useState(false);

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
        if (!shop || !selectedDate) return;
        loadTimes();
    }, [shop, selectedDate]);

    const loadTimes = async () => {
        try {
            const data = await getAvailableTimes(shop.shopId, selectedDate);
            setTimes(data);
        } catch (err) {
            console.error("시간대 조회 실패:", err);
        }
    };

    const handleCreateSingle = async () => {
        if (!selectedDate || !singleTime) {
            alert("날짜와 시간을 입력해주세요.");
            return;
        }
        try {
            await createAvailableTime({
                shopId: shop.shopId,
                availableDate: selectedDate,
                availableTime: singleTime,
                capacity: Number(singleCapacity),
            });
            setSingleTime("");
            loadTimes();
        } catch (err) {
            alert(err.response?.data || "등록에 실패했습니다.");
        }
    };

    const toggleBulkDay = (day) => {
        setBulkDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleCreateBulk = async () => {
        if (!bulkStart || !bulkEnd || bulkDays.length === 0) {
            alert("기간과 요일을 선택해주세요.");
            return;
        }

        const times = bulkTimesText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        if (times.length === 0) {
            alert("시간을 입력해주세요. (예: 09:00, 10:00)");
            return;
        }

        try {
            const created = await createAvailableTimesBulk({
                shopId: shop.shopId,
                startDate: bulkStart,
                endDate: bulkEnd,
                daysOfWeek: bulkDays,
                times,
                capacity: Number(bulkCapacity),
            });
            alert(`${created.length}개의 시간대가 생성되었습니다.`);
            setShowBulkForm(false);
            if (selectedDate) loadTimes();
        } catch (err) {
            alert(err.response?.data || "생성에 실패했습니다.");
        }
    };

    const handleUpdateCapacity = async (availableTimeId, currentCapacity) => {
        const input = window.prompt("새 정원을 입력하세요.", currentCapacity);
        if (input === null) return;
        const capacity = Number(input);
        if (!capacity || capacity < 1) {
            alert("올바른 숫자를 입력해주세요.");
            return;
        }
        try {
            await updateAvailableTimeCapacity(availableTimeId, capacity);
            loadTimes();
        } catch (err) {
            alert(err.response?.data || "수정에 실패했습니다.");
        }
    };

    const handleDelete = async (availableTimeId) => {
        if (!window.confirm("이 시간대를 삭제하시겠습니까?")) return;
        try {
            await deleteAvailableTime(availableTimeId);
            loadTimes();
        } catch (err) {
            alert(err.response?.data || "삭제에 실패했습니다.");
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
        <div className="page" style={{ maxWidth: 640 }}>
            <div className="page-header">
                <span className="eyebrow">SHOP DASHBOARD</span>
                <h1 style={{ fontSize: 28 }}>예약 시간대 관리</h1>
                <p style={{ marginTop: 6 }}>{shop.name}</p>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: 18 }}>자동 생성</h2>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowBulkForm((v) => !v)}>
                        {showBulkForm ? "닫기" : "자동 생성 열기"}
                    </button>
                </div>

                {showBulkForm && (
                    <div style={{ marginTop: 16 }}>
                        <div className="field">
                            <label className="field-label">기간</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input type="date" className="input" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} />
                                <input type="date" className="input" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} />
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label">요일 선택</label>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {DAYS.map((d) => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        className={`chip ${bulkDays.includes(d.value) ? "chip--selected" : ""}`}
                                        onClick={() => toggleBulkDay(d.value)}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label">시간대 (쉼표로 구분)</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="09:00, 10:00, 11:00"
                                value={bulkTimesText}
                                onChange={(e) => setBulkTimesText(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label className="field-label">각 시간대 정원</label>
                            <input
                                className="input"
                                type="number"
                                min="1"
                                style={{ maxWidth: 120 }}
                                value={bulkCapacity}
                                onChange={(e) => setBulkCapacity(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary" onClick={handleCreateBulk}>
                            생성하기
                        </button>
                    </div>
                )}
            </div>

            <div className="card">
                <h2 style={{ fontSize: 18, marginBottom: 12 }}>날짜별 시간대 확인 / 개별 등록</h2>

                <input
                    type="date"
                    className="input"
                    style={{ maxWidth: 220, marginBottom: 16 }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />

                {selectedDate && (
                    <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
                            <div className="field" style={{ marginBottom: 0 }}>
                                <label className="field-label">시간</label>
                                <input type="time" className="input" value={singleTime} onChange={(e) => setSingleTime(e.target.value)} />
                            </div>
                            <div className="field" style={{ marginBottom: 0 }}>
                                <label className="field-label">정원</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    style={{ maxWidth: 100 }}
                                    value={singleCapacity}
                                    onChange={(e) => setSingleCapacity(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleCreateSingle}>
                                추가
                            </button>
                        </div>

                        {times.length === 0 ? (
                            <p style={{ fontSize: 14 }}>등록된 시간대가 없습니다.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {times.map((t) => (
                                    <div
                                        key={t.availableTimeId}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: 12,
                                            border: "1px solid var(--color-line)",
                                            borderRadius: "var(--radius-sm)",
                                        }}
                                    >
                                        <span>{t.availableTime}</span>
                                        <span style={{ fontSize: 13, color: t.full ? "var(--color-danger)" : "var(--color-ink-soft)" }}>
                                            {t.reservedCount} / {t.capacity}명 {t.full && "(마감)"}
                                        </span>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleUpdateCapacity(t.availableTimeId, t.capacity)}
                                            >
                                                정원 수정
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(t.availableTimeId)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}