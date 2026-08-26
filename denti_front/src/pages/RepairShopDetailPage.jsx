import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ShopReviewSection from "../components/review/ShopReviewSection";
import MyReviewSection from "../components/review/MyReviewSection";
import { getRepairShopHours } from "../api/repairShopHourAPI";
import { getRepairShopByShopId } from "../api/repairShopAPI";
import { getAvailableTimes, createReservation } from "../api/reservationAPI";
import { getMyVehicles, createVehicle } from "../api/vehicleAPI";

function RepairShopDetailPage() {
    const { shopId } = useParams();
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const [shop, setShop] = useState(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [shopHours, setShopHours] = useState([]);

    // 차량 선택/등록 관련
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [showQuickRegister, setShowQuickRegister] = useState(false);
    const [newManufacturer, setNewManufacturer] = useState("");
    const [newModel, setNewModel] = useState("");

    // 1. 정비소 정보 조회
    useEffect(() => {
        const getShop = async () => {
            try {
                const data = await getRepairShopByShopId(shopId);
                setShop(data);
            } catch (error) {
                console.error("정비소 상세 조회 실패:", error);
            }
        };
        getShop();
    }, [shopId]);

    // 2. 카카오 지도 SDK 로딩 확인
    useEffect(() => {
        const checkKakao = () => {
            if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === "function") {
                setKakaoLoaded(true);
                return true;
            }
            return false;
        };
        if (checkKakao()) return;
        const interval = setInterval(() => {
            if (checkKakao()) clearInterval(interval);
        }, 300);
        return () => clearInterval(interval);
    }, []);

    // 정비소 영업시간 조회
    useEffect(() => {
        if (!shop) return;
        const getShopHours = async () => {
            try {
                const data = await getRepairShopHours(shop.shopId);
                setShopHours(data);
            } catch (error) {
                console.error("영업시간 조회 실패:", error);
                setShopHours([]);
            }
        };
        getShopHours();
    }, [shop]);

    // 내 차량 목록 조회
    useEffect(() => {
        if (!loginUser) return;
        loadVehicles();
    }, [loginUser]);

    const loadVehicles = async () => {
        try {
            const data = await getMyVehicles(loginUser.userId);
            setVehicles(data);
        } catch (error) {
            console.error("차량 조회 실패:", error);
        }
    };

    // 차량 빠른 등록
    const handleQuickRegisterVehicle = async () => {
        if (!newManufacturer || !newModel) {
            alert("제조사와 모델을 입력해주세요.");
            return;
        }
        try {
            const created = await createVehicle({
                userId: loginUser.userId,
                manufacturer: newManufacturer,
                model: newModel,
            });
            await loadVehicles();
            setSelectedVehicleId(created.vehicleId);
            setNewManufacturer("");
            setNewModel("");
            setShowQuickRegister(false);
        } catch (error) {
            console.error("차량 등록 실패:", error);
            alert("차량 등록에 실패했습니다.");
        }
    };

    // 3. 날짜 선택 시 예약 가능 시간 조회
    useEffect(() => {
        if (!shop) return;
        if (!selectedDate) return;
        const loadAvailableTimes = async () => {
            try {
                const data = await getAvailableTimes(shop.shopId, selectedDate);
                setAvailableTimes(data);
            } catch (error) {
                console.error("예약 가능 시간 조회 실패:", error);
                setAvailableTimes([]);
            }
        };
        loadAvailableTimes();
    }, [shop, selectedDate]);

    // 4. 정비소 + 카카오 SDK가 모두 준비되면 지도 생성
    useEffect(() => {
        if (!shop) return;
        if (!kakaoLoaded) return;

        window.kakao.maps.load(() => {
            const container = document.getElementById("detail-map");
            if (!container) return;

            const position = new window.kakao.maps.LatLng(shop.latitude, shop.longitude);
            const map = new window.kakao.maps.Map(container, { center: position, level: 3 });
            new window.kakao.maps.Marker({ position, map });
        });
    }, [shop, kakaoLoaded]);

    if (!shop) {
        return (
            <div className="page">
                <div className="empty-state">정비소 정보를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">REPAIR SHOP</span>
                <h1 style={{ fontSize: 30 }}>{shop.shopName || "정비소"}</h1>
                <p style={{ marginTop: 6 }}>{shop.address}</p>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 12 }}>영업시간</h2>
                {shopHours.length === 0 ? (
                    <p style={{ fontSize: 14 }}>등록된 영업시간이 없습니다.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {shopHours.map((hour) => (
                            <div key={hour.hourId} style={{ display: "flex", gap: 12, fontSize: 14 }}>
                                <strong style={{ minWidth: 92, flex: "none" }}>{hour.dayOfWeek}</strong>
                                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-soft)" }}>
                                    {hour.openTime} ~ {hour.closeTime}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div id="detail-map" style={{ width: "100%", height: "360px" }} />
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16 }}>예약 가능 시간</h2>

                <input
                    type="date"
                    className="input"
                    style={{ maxWidth: 220, marginBottom: 16 }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />

                {availableTimes.length === 0 ? (
                    <p style={{ fontSize: 14 }}>예약 가능한 시간이 없습니다.</p>
                ) : (
                    <div className="chip-grid">
                        {availableTimes.map((time) => (
                            <button
                                key={time.availableTimeId}
                                type="button"
                                className={`chip ${
                                    selectedTime?.availableTimeId === time.availableTimeId ? "chip--selected" : ""
                                } ${time.reserved ? "chip--disabled" : ""}`}
                                disabled={time.reserved}
                                onClick={() => setSelectedTime(time)}
                            >
                                {time.availableTime}
                                {time.reserved && " (예약됨)"}
                            </button>
                        ))}
                    </div>
                )}
                
                {selectedTime && (
                    <div style={{ marginTop: 24 }}>
                        <h3 style={{ marginBottom: 12 }}>예약할 차량 선택</h3>

                        {!loginUser ? (
                            <p className="form-error">로그인 후 예약을 신청할 수 있습니다.</p>
                        ) : (
                            <>
                                {vehicles.length > 0 && (
                                    <select
                                        className="select"
                                        style={{ maxWidth: 280, marginBottom: 12 }}
                                        value={selectedVehicleId}
                                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    >
                                        <option value="">차량을 선택하세요</option>
                                        {vehicles.map((v) => (
                                            <option key={v.vehicleId} value={v.vehicleId}>
                                                {v.manufacturer} {v.model}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {!showQuickRegister ? (
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => setShowQuickRegister(true)}
                                        >
                                            + 새 차량 등록
                                        </button>
                                    </div>
                                ) : (
                                    <div className="card" style={{ background: "var(--color-surface)" }}>
                                        <div className="field">
                                            <label className="field-label">제조사</label>
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="예: 현대"
                                                value={newManufacturer}
                                                onChange={(e) => setNewManufacturer(e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label className="field-label">모델</label>
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="예: 아반떼"
                                                value={newModel}
                                                onChange={(e) => setNewModel(e.target.value)}
                                            />
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="btn btn-primary btn-sm" onClick={handleQuickRegisterVehicle}>
                                                등록하고 선택
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setShowQuickRegister(false)}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 16 }}
                            disabled={!loginUser || !selectedVehicleId}
                            onClick={async () => {
                                try {
                                    const data = await createReservation({
                                        userId: loginUser.userId,
                                        vehicleId: Number(selectedVehicleId),
                                        shopId: shop.shopId,
                                        availableTimeId: selectedTime.availableTimeId,
                                    });

                                    console.log("예약 성공:", data);
                                    alert("예약이 신청되었습니다.");
                                } catch (error) {
                                    console.error("예약 신청 실패:", error);
                                    if (error.response) {
                                        console.log("서버 응답:", error.response.data);
                                    }
                                    alert("예약 신청에 실패했습니다.");
                                }
                            }}
                        >
                            예약하기
                        </button>
                    </div>
                )}
            </div>

            <div className="card">
                <ShopReviewSection shopId={shop.shopId} currentUserId={loginUser?.userId} />
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16 }}>내 리뷰</h2>
                <MyReviewSection currentUserId={loginUser?.userId} />
            </div>
        </div>
    );
}

export default RepairShopDetailPage;