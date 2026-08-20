import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
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
        return <div>정비소 정보를 불러오는 중...</div>;
    }

    return (
        <div>
            <h1>{shop.shopName || "정비소"}</h1>

            <div>
                <h2>정비소 정보</h2>

                <p>주소: {shop.address}</p>
                <p>위도: {shop.latitude}</p>
                <p>경도: {shop.longitude}</p>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h2>영업시간</h2>

                {shopHours.length === 0 ? (
                    <p>등록된 영업시간이 없습니다.</p>
                ) : (
                    shopHours.map((hour) => (
                        <div key={hour.hourId}>
                            <strong>{hour.dayOfWeek}</strong>
                            {" : "}
                            {hour.openTime}
                            {" ~ "}
                            {hour.closeTime}
                        </div>
                    ))
                )}
            </div>

            <div
                id="detail-map"
                style={{
                    width: "100%",
                    height: "400px",
                    marginTop: "20px",
                }}
            ></div>

            <div style={{ marginTop: "30px" }}>
                <h2>정비 항목</h2>

                {repairItems.length === 0 ? (
                    <p>등록된 정비 항목이 없습니다.</p>
                ) : (
                    repairItems.map((item) => (
                        <button
                            key={item.itemId}
                            onClick={() => {
                                console.log("선택한 정비 항목:", item);
                                setSelectedItem(item);
                            }}
                            style={{
                                display: "block",
                                width: "100%",
                                maxWidth: "500px",
                                marginBottom: "10px",
                                padding: "12px",
                                textAlign: "left",
                                cursor: "pointer",
                                backgroundColor:
                                    selectedItem?.itemId === item.itemId
                                        ? "#333"
                                        : "#fff",
                                color:
                                    selectedItem?.itemId === item.itemId
                                        ? "#fff"
                                        : "#000",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}
                        >
                            <strong>{item.name}</strong>

                            <br />

                            <span>
                                {item.description}
                            </span>

                            <br />

                            <span>
                                가격: {item.price?.toLocaleString()}원
                            </span>

                            <br />

                            <span>
                                예상 소요시간: {item.estimatedMinutes}분
                            </span>
                        </button>
                    ))
                )}

                {selectedItem && (
                    <p>
                        선택한 정비 항목:{" "}
                        <strong>{selectedItem.name}</strong>
                    </p>
                )}
            </div>

            <div style={{ marginTop: "30px" }}>
                <h2>예약 가능 시간</h2>

                <input
                    type="date"
                    id="reservation-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />

                <div style={{ marginTop: "15px" }}>
                    {availableTimes.length === 0 ? (
                        <p>예약 가능한 시간이 없습니다.</p>
                    ) : (
                        availableTimes.map((time) => (
                            <button
                                key={time.availableTimeId}
                                onClick={() => {
                                    console.log("선택한 예약 시간:", time);
                                    setSelectedTime(time);
                                }}
                                style={{
                                    marginRight: "10px",
                                    marginBottom: "10px",
                                    padding: "10px 15px",
                                    cursor: "pointer",
                                    backgroundColor:
                                        selectedTime?.availableTimeId === time.availableTimeId
                                            ? "#333"
                                            : "#fff",
                                    color:
                                        selectedTime?.availableTimeId === time.availableTimeId
                                            ? "#fff"
                                            : "#000",
                                }}
                            >
                                {time.availableTime}
                            </button>
                        ))
                    )}
                </div>

                {selectedTime && (
                    <div style={{ marginTop: "20px" }}>
                        <p>
                            선택한 시간:{" "}
                            <strong>{selectedTime.availableTime}</strong>
                        </p>

                        {!loginUser && (
                            <p style={{ color: "#c0392b", marginBottom: "10px" }}>
                                로그인 후 예약을 신청할 수 있습니다.
                            </p>
                        )}

                        <button
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
                            style={{
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            예약하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RepairShopDetailPage;