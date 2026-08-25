import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ShopReviewSection from "../components/review/ShopReviewSection";
import MyReviewSection from "../components/review/MyReviewSection";
import { getRepairItemsByShop } from "../api/repairItemAPI";
import { getRepairShopHours } from "../api/repairShopHourAPI";

function RepairShopDetailPage() {
    const { shopId } = useParams();
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const [shop, setShop] = useState(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [repairItems, setRepairItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [shopHours, setShopHours] = useState([]);

    // 1. 정비소 정보 조회
    useEffect(() => {
        const getShop = async () => {
            try {
                const response = await axios.get(
                    `/api/repair-shop-addresses/shop/${shopId}`
                );

                console.log("정비소 상세:", response.data);
                setShop(response.data);
            } catch (error) {
                console.error("정비소 상세 조회 실패:", error);
            }
        };

        getShop();
    }, [shopId]);

    // 2. 카카오 지도 SDK 로딩 확인
    useEffect(() => {
        const checkKakao = () => {
            if (
                window.kakao &&
                window.kakao.maps &&
                typeof window.kakao.maps.load === "function"
            ) {
                console.log("카카오 지도 SDK 확인 완료");
                setKakaoLoaded(true);
                return true;
            }

            return false;
        };

        if (checkKakao()) {
            return;
        }

        const interval = setInterval(() => {
            if (checkKakao()) {
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // 정비소의 정비 항목 조회
    useEffect(() => {
        if (!shop) return;

        const getRepairItems = async () => {
            try {
                const data = await getRepairItemsByShop(shop.shopId);

                console.log("정비 항목:", data);

                setRepairItems(data);
            } catch (error) {
                console.error("정비 항목 조회 실패:", error);
                setRepairItems([]);
            }
        };

        getRepairItems();
    }, [shop]);

    // 정비소 영업시간 조회
    useEffect(() => {
        if (!shop) return;

        const getShopHours = async () => {
            try {
                const data = await getRepairShopHours(shop.shopId);

                console.log("정비소 영업시간:", data);

                setShopHours(data);
            } catch (error) {
                console.error("영업시간 조회 실패:", error);
                setShopHours([]);
            }
        };

        getShopHours();
    }, [shop]);

    // 3. 날짜 선택 시 예약 가능 시간 조회
    useEffect(() => {
        if (!shop) return;
        if (!selectedDate) return;

        const getAvailableTimes = async () => {
            try {
                const response = await axios.get(
                    `/api/available-times/shop/${shop.shopId}`,
                    {
                        params: {
                            date: selectedDate,
                        },
                    }
                );

                console.log("예약 가능 시간:", response.data);

                setAvailableTimes(response.data);
            } catch (error) {
                console.error("예약 가능 시간 조회 실패:", error);
                setAvailableTimes([]);
            }
        };

        getAvailableTimes();
    }, [shop, selectedDate]);

    // 4. 정비소 + 카카오 SDK가 모두 준비되면 지도 생성
    useEffect(() => {
        if (!shop) return;
        if (!kakaoLoaded) return;

        console.log("지도 생성 시작");
        console.log("shop:", shop);

        window.kakao.maps.load(() => {
            console.log("카카오 지도 API 로드 완료");

            const container = document.getElementById("detail-map");

            if (!container) {
                console.log("지도 컨테이너가 없음");
                return;
            }

            const position = new window.kakao.maps.LatLng(
                shop.latitude,
                shop.longitude
            );

            const map = new window.kakao.maps.Map(container, {
                center: position,
                level: 3,
            });

            new window.kakao.maps.Marker({
                position: position,
                map: map,
            });

            console.log("상세 페이지 지도 생성 성공");
        });
    }, [shop, kakaoLoaded]);

    console.log("현재 shopId:", shopId);

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
                                <strong style={{ width: 48 }}>{hour.dayOfWeek}</strong>
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
                <h2 style={{ marginBottom: 16 }}>정비 항목</h2>

                {repairItems.length === 0 ? (
                    <p style={{ fontSize: 14 }}>등록된 정비 항목이 없습니다.</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 12,
                        }}
                    >
                        {repairItems.map((item) => (
                            <button
                                key={item.itemId}
                                type="button"
                                className={`select-card ${
                                    selectedItem?.itemId === item.itemId ? "select-card--selected" : ""
                                }`}
                                onClick={() => {
                                    console.log("선택한 정비 항목:", item);
                                    setSelectedItem(item);
                                }}
                            >
                                <p className="select-card__title">{item.name}</p>
                                <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                                    {item.description}
                                </p>
                                <div className="select-card__meta">
                                    <span style={{ fontFamily: "var(--font-mono)" }}>
                                        {item.price?.toLocaleString()}원
                                    </span>
                                    <span>약 {item.estimatedMinutes}분</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedItem && (
                    <p style={{ marginTop: 16, fontSize: 14 }}>
                        선택한 정비 항목: <strong style={{ color: "var(--color-ink)" }}>{selectedItem.name}</strong>
                    </p>
                )}
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16 }}>예약 가능 시간</h2>

                <input
                    type="date"
                    id="reservation-date"
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
                                    selectedTime?.availableTimeId === time.availableTimeId
                                        ? "chip--selected"
                                        : ""
                                }`}
                                onClick={() => {
                                    console.log("선택한 예약 시간:", time);
                                    setSelectedTime(time);
                                }}
                            >
                                {time.availableTime}
                            </button>
                        ))}
                    </div>
                )}

                {selectedTime && (
                    <div style={{ marginTop: 20 }}>
                        <p style={{ fontSize: 14 }}>
                            선택한 시간: <strong style={{ color: "var(--color-ink)" }}>{selectedTime.availableTime}</strong>
                        </p>

                        {!loginUser && (
                            <p className="form-error">로그인 후 예약을 신청할 수 있습니다.</p>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 8 }}
                            onClick={async () => {
                                if (!loginUser) {
                                    alert("로그인 후 이용해주세요.");
                                    navigate("/login");
                                    return;
                                }

                                if (!selectedItem) {
                                    alert("정비 항목을 선택해주세요.");
                                    return;
                                }

                                try {
                                    const response = await axios.post(
                                        "http://localhost:8080/api/reservations",
                                        {
                                            userId: loginUser.userId,
                                            shopId: shop.shopId,
                                            itemId: selectedItem.itemId,
                                            availableTimeId: selectedTime.availableTimeId,
                                        },
                                        {
                                            withCredentials: true,
                                        }
                                    );

                                    console.log("예약 성공:", response.data);

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
                <ShopReviewSection
                    shopId={shop.shopId}
                    currentUserId={loginUser?.userId}
                />
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16 }}>내 리뷰</h2>

                <MyReviewSection
                    currentUserId={loginUser?.userId}
                />
            </div>
        </div>
    );
}

export default RepairShopDetailPage;