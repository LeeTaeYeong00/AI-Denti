import { useEffect, useRef, useState } from "react";
import axios from "axios";

function MapPage() {
    const mapContainer = useRef(null);

    const [addresses, setAddresses] = useState([]);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);

    // 정비소 주소 조회
    useEffect(() => {
        const getAddresses = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/repair-shop-addresses"
                );

                console.log("주소 데이터:", response.data);

                setAddresses(response.data);
            } catch (error) {
                console.error("주소 조회 실패:", error);
            }
        };

        getAddresses();
    }, []);

    // 카카오 지도 SDK 로딩 확인 (로드될 때까지 계속 체크)
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

    // 카카오 지도 생성 (주소 + SDK 로딩이 모두 끝나면 실행)
    useEffect(() => {
        if (addresses.length === 0) {
            return;
        }

        if (!kakaoLoaded) {
            console.log("카카오 지도 SDK가 아직 로드되지 않음, 대기 중...");
            return;
        }

        window.kakao.maps.load(() => {
            console.log("카카오 지도 API 로드 성공");

            const firstAddress = addresses[0];

            const center = new window.kakao.maps.LatLng(
                firstAddress.latitude,
                firstAddress.longitude
            );

            const map = new window.kakao.maps.Map(
                mapContainer.current,
                {
                    center: center,
                    level: 5
                }
            );

            console.log("지도 생성 성공");

            addresses.forEach((address) => {
                const position = new window.kakao.maps.LatLng(
                    address.latitude,
                    address.longitude
                );

                const marker = new window.kakao.maps.Marker({
                    map: map,
                    position: position
                });

                const infoWindow = new window.kakao.maps.InfoWindow({
                    content: `
                        <div style="
                            padding: 12px;
                            font-size: 14px;
                            min-width: 180px;
                        ">
                            <strong>${address.shopName}</strong>

                            <div style="
                                margin-top: 6px;
                                color: #555;
                                font-size: 13px;
                            ">
                                ${address.address}
                            </div>

                            <button
                                id="detail-button-${address.addressId}"
                                style="
                                    margin-top: 10px;
                                    padding: 6px 10px;
                                    border: none;
                                    border-radius: 4px;
                                    background: #333;
                                    color: white;
                                    cursor: pointer;
                                "
                            >
                                상세보기
                            </button>
                        </div>
                    `
                });

                window.kakao.maps.event.addListener(
                    marker,
                    "click",
                    () => {
                        infoWindow.open(map, marker);

                        setTimeout(() => {
                            const button = document.getElementById(
                                `detail-button-${address.addressId}`
                            );

                            if (button) {
                                button.onclick = () => {
                                    window.location.href =
                                        `/repair-shops/${address.shopId}`;
                                };
                            }
                        }, 100);
                    }
                );
            });

            console.log("마커 생성 성공");
        });
    }, [addresses, kakaoLoaded]);

    return (
        <div>
            <h1>정비소 지도</h1>

            <div
                ref={mapContainer}
                style={{
                    width: "800px",
                    height: "500px"
                }}
            />
        </div>
    );
}

export default MapPage;