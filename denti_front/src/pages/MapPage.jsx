import { useEffect, useRef, useState } from "react";
import { getRepairShopAddresses } from "../api/repairShopAPI";

function MapPage() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    const [addresses, setAddresses] = useState([]);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [appliedKeyword, setAppliedKeyword] = useState("");

    const filteredAddresses = addresses.filter((address) => {
        const keyword = appliedKeyword.trim().toLowerCase();
        if (!keyword) return true;
        return (
            address.shopName?.toLowerCase().includes(keyword) ||
            address.address?.toLowerCase().includes(keyword)
        );
    });

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

        if (checkKakao()) return;

        const interval = setInterval(() => {
            if (checkKakao()) clearInterval(interval);
        }, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!kakaoLoaded) {
            console.log("카카오 지도 SDK가 아직 로드되지 않음");
            return;
        }

        window.kakao.maps.load(() => {
            console.log("카카오 지도 API 로드 성공");

            const DEFAULT_CENTER = {
                latitude: 37.5665,
                longitude: 126.978,
            };

            const firstAddress = addresses[0] ?? DEFAULT_CENTER;

            const center = new window.kakao.maps.LatLng(
                firstAddress.latitude,
                firstAddress.longitude
            );

            const map = new window.kakao.maps.Map(mapContainer.current, {
                center,
                level: 5,
            });

            mapRef.current = map;

            console.log(
                "지도 생성 성공",
                `(등록된 정비소 ${addresses.length}곳)`
            );
        });
    }, [addresses, kakaoLoaded]);

    useEffect(() => {
        if (!mapRef.current || !window.kakao?.maps) {
            return;
        }

        const map = mapRef.current;

        markersRef.current.forEach((marker) => {
            marker.setMap(null);
        });

        markersRef.current = [];

        // 현재 열려있는 InfoWindow와, 그걸 연 마커를 기억 (마커 재생성마다 새로 초기화)
        let openInfoWindow = null;
        let openMarker = null;

        filteredAddresses.forEach((address) => {
            const position = new window.kakao.maps.LatLng(
                address.latitude,
                address.longitude
            );

            const marker = new window.kakao.maps.Marker({
                map,
                position,
            });

            markersRef.current.push(marker);

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
                `,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
                if (openInfoWindow) {
                    openInfoWindow.close();
                }

                if (openMarker === marker) {
                    openInfoWindow = null;
                    openMarker = null;
                    return;
                }

                infoWindow.open(map, marker);
                openInfoWindow = infoWindow;
                openMarker = marker;

                setTimeout(() => {
                    const button = document.getElementById(
                        `detail-button-${address.addressId}`
                    );

                    if (button) {
                        button.onclick = () => {
                            window.location.href = `/repair-shops/${address.shopId}`;
                        };
                    }
                }, 100);
            });
        });

        if (filteredAddresses.length > 0 && appliedKeyword.trim()) {
            const bounds = new window.kakao.maps.LatLngBounds();

            filteredAddresses.forEach((address) => {
                const position = new window.kakao.maps.LatLng(
                    address.latitude,
                    address.longitude
                );
                bounds.extend(position);
            });

            map.setBounds(bounds);
        }

        console.log(
            "마커 생성 완료",
            `(검색 결과 ${filteredAddresses.length}곳)`
        );
    }, [filteredAddresses, appliedKeyword]);

    const handleSearch = () => {
        setAppliedKeyword(searchKeyword);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">FIND A SHOP</span>
                <h1 style={{ fontSize: 28 }}>정비소 지도</h1>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                }}
            >
                <input
                    type="text"
                    placeholder="정비소 이름 또는 주소를 검색하세요"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                    }}
                />

                <button
                    type="button"
                    onClick={handleSearch}
                    style={{
                        padding: "0 20px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#14171c",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    검색
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setSearchKeyword("");
                        setAppliedKeyword("");
                    }}
                    style={{
                        padding: "0 20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#333",
                        cursor: "pointer",
                    }}
                >
                    초기화
                </button>
            </div>

            <div
                style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    color: "#666",
                }}
            >
                {appliedKeyword.trim()
                    ? `검색 결과 ${filteredAddresses.length}곳`
                    : `등록된 정비소 ${filteredAddresses.length}곳`}
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

            <div style={{ marginTop: "20px" }}>
                <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
                    검색 결과
                </h2>

                {filteredAddresses.map((address) => (
                    <div
                        key={address.addressId}
                        onClick={() => {
                            const position = new window.kakao.maps.LatLng(
                                address.latitude,
                                address.longitude
                            );

                            mapRef.current.setCenter(position);
                            mapRef.current.setLevel(5);
                        }}
                        style={{
                            padding: "18px",
                            marginBottom: "12px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            cursor: "pointer",
                            background: "#fff",
                            transition: "box-shadow 0.2s, transform 0.2s",
                        }}
                    >
                        <strong>{address.shopName}</strong>

                        <div
                            style={{
                                marginTop: "6px",
                                fontSize: "14px",
                                color: "#666",
                            }}
                        >
                            {address.address}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "12px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/repair-shops/${address.shopId}`;
                                }}
                                style={{
                                    padding: "8px 14px",
                                    border: "none",
                                    borderRadius: "6px",
                                    background: "#14171c",
                                    color: "white",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                상세보기
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAddresses.length === 0 && (
                <div
                    style={{
                        marginTop: "16px",
                        padding: "20px",
                        textAlign: "center",
                        color: "#777",
                    }}
                >
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    );
}

export default MapPage;