import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function RepairShopDetailPage() {
    const { shopId } = useParams();

    const [shop, setShop] = useState(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

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

            <div
                id="detail-map"
                style={{
                    width: "100%",
                    height: "400px",
                    marginTop: "20px",
                }}
            ></div>

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

                        <button
                            onClick={() => {
                                console.log("예약하기:", {
                                    shopId: shop.shopId,
                                    date: selectedDate,
                                    time: selectedTime.availableTime,
                                });

                                alert("예약 기능 연결 예정");
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