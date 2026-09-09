import { useEffect, useRef, useState } from "react";
import { getRepairShopAddresses } from "../api/repairShopAPI";

function MapPage() {
    const mapContainer = useRef(null);

    const [addresses, setAddresses] = useState([]);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);

    // 정비소 주소 조회
    useEffect(() => {
        const getAddresses = async () => {
            try {
                const data = await getRepairShopAddresses();

                console.log("주소 데이터:", data);

                setAddresses(data);
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

    // 카카오 지도 생성 (SDK 로딩만 끝나면 실행 - 주소가 없어도 기본 위치로 지도를 띄운다)
    useEffect(() => {
        if (!kakaoLoaded) {
            console.log("카카오 지도 SDK가 아직 로드되지 않음, 대기 중...");
            return;
        }

        window.kakao.maps.load(() => {
            console.log("카카오 지도 API 로드 성공");

            // 등록된 주소가 있으면 첫 번째 주소를, 없으면 서울시청을 기본 중심으로 사용한다.
            const DEFAULT_CENTER = { latitude: 37.5665, longitude: 126.978 };
            const firstAddress = addresses[0] ?? DEFAULT_CENTER;

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

            console.log("지도 생성 성공", `(등록된 정비소 ${addresses.length}곳)`);

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
                            font-family: Inter, system-ui, sans-serif;
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
                                    border-radius: 6px;
                                    background: #14171c;
                                    color: white;
                                    font-size: 13px;
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
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">FIND A SHOP</span>
                <h1 style={{ fontSize: 28 }}>정비소 지도</h1>
            </div>

            <div
                ref={mapContainer}
                className="card"
                style={{
                    width: "100%",
                    height: "560px",
                    padding: 0,
                    overflow: "hidden",
                }}
            />
        </div>
    );
}

export default MapPage;
