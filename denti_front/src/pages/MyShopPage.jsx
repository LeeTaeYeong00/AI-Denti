import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getMyRepairShops,
    registerRepairShop,
    deleteRepairShop,
    resubmitRepairShop,
} from "../api/repairShopAPI";

const STATUS_LABEL = {
    PENDING: "승인 대기중",
    APPROVED: "승인됨",
    REJECTED: "반려됨",
};

export default function MyShopPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState({ type: "list" }); // { type: "list" } | { type: "register" } | { type: "edit", shop }

    useEffect(() => {
        if (!loginUser) return;
        loadShops();
    }, [loginUser]);

    const loadShops = async () => {
        try {
            const data = await getMyRepairShops();
            setShops(data);
        } catch (err) {
            setShops([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (shopId) => {
        if (!window.confirm("정말 이 정비소를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) return;
        try {
            await deleteRepairShop(shopId);
            alert("정비소가 삭제되었습니다.");
            loadShops();
        } catch (err) {
            alert("삭제에 실패했습니다.");
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

    if (mode.type === "register") {
        return (
            <ShopForm
                mode="register"
                onCancel={() => setMode({ type: "list" })}
                onSuccess={() => {
                    setMode({ type: "list" });
                    loadShops();
                }}
            />
        );
    }

    if (mode.type === "edit") {
        return (
            <ShopForm
                mode="edit"
                shop={mode.shop}
                onCancel={() => setMode({ type: "list" })}
                onSuccess={() => {
                    setMode({ type: "list" });
                    loadShops();
                }}
            />
        );
    }

    return (
        <div className="page" style={{ maxWidth: 560 }}>
            <div className="page-header">
                <span className="eyebrow">MY SHOP</span>
                <h1 style={{ fontSize: 28 }}>내 정비소</h1>
            </div>

            {shops.length === 0 ? (
                <div className="empty-state">아직 등록한 정비소가 없습니다.</div>
            ) : (
                shops.map((shop) => (
                    <div key={shop.shopId} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h3 style={{ marginBottom: 4 }}>{shop.name}</h3>
                                <p style={{ fontSize: 14 }}>{shop.phone}</p>
                            </div>
                            <span className={`badge badge-${shop.approvalStatus.toLowerCase()}`}>
                                {STATUS_LABEL[shop.approvalStatus] ?? shop.approvalStatus}
                            </span>
                        </div>

                        {shop.approvalStatus === "APPROVED" && (
                            <div style={{ marginTop: 16 }}>
                                <p style={{ fontSize: 13, marginBottom: 12, color: "var(--color-ink-soft)" }}>
                                    승인된 정비소입니다. 정비소 관리 기능을 이용하실 수 있습니다.
                                </p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate(`/shop-reservations?shopId=${shop.shopId}`)}
                                    >
                                        예약 관리
                                    </button>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => navigate("/repair-items")}
                                    >
                                        정비 항목 관리
                                    </button>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => navigate("/products")}
                                    >
                                        상품 관리
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(shop.shopId)}>
                                        정비소 삭제
                                    </button>
                                </div>
                            </div>
                        )}

                        {shop.approvalStatus === "PENDING" && (
                            <div style={{ marginTop: 12 }}>
                                <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 8 }}>
                                    관리자 승인을 기다리고 있습니다.
                                </p>
                                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(shop.shopId)}>
                                    등록 취소
                                </button>
                            </div>
                        )}

                        {shop.approvalStatus === "REJECTED" && (
                            <div style={{ marginTop: 12 }}>
                                <p className="form-error" style={{ marginBottom: 8 }}>
                                    반려 사유: {shop.rejectReason || "사유가 등록되지 않았습니다."}
                                </p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => setMode({ type: "edit", shop })}>
                                        수정 후 재등록
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(shop.shopId)}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}

            <button
                className="btn btn-outline btn-block"
                style={{ marginTop: 16 }}
                onClick={() => setMode({ type: "register" })}
            >
                + 정비소 등록하기
            </button>
        </div>
    );
}

// 정비소 등록/재등록 공용 폼 (지도+주소검색 포함)
function ShopForm({ mode, shop, onCancel, onSuccess }) {
    const isEdit = mode === "edit";

    const [form, setForm] = useState({
        name: shop?.name ?? "",
        phone: shop?.phone ?? "",
        description: shop?.description ?? "",
    });
    const [businessDoc, setBusinessDoc] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const geocoderRef = useRef(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [coords, setCoords] = useState(null);
    const [addressError, setAddressError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setBusinessDoc(e.target.files[0] ?? null);
    };

    useEffect(() => {
        const checkKakao = () => {
            if (window.kakao?.maps?.load) {
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
        if (!kakaoLoaded || !mapContainer.current || mapReady) return;

        window.kakao.maps.load(() => {
            const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.978);
            const map = new window.kakao.maps.Map(mapContainer.current, {
                center: defaultCenter,
                level: 4,
            });
            mapInstance.current = map;
            geocoderRef.current = new window.kakao.maps.services.Geocoder();

            window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
                setMarkerAndAddress(mouseEvent.latLng);
            });

            setMapReady(true);
        });
    }, [kakaoLoaded, mapReady]);

    const setMarkerAndAddress = (latlng) => {
        if (markerInstance.current) {
            markerInstance.current.setPosition(latlng);
        } else {
            markerInstance.current = new window.kakao.maps.Marker({
                position: latlng,
                map: mapInstance.current,
            });
        }

        geocoderRef.current.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const roadAddr = result[0].road_address?.address_name;
                const jibunAddr = result[0].address.address_name;
                setRoadAddress(roadAddr || jibunAddr);
                setCoords({ latitude: latlng.getLat(), longitude: latlng.getLng() });
                setAddressError("");
            } else {
                setAddressError("주소를 확인할 수 없습니다. 다른 위치를 클릭해주세요.");
            }
        });
    };

    const handleSearchAddress = () => {
        if (!searchKeyword.trim()) {
            setAddressError("검색할 주소를 입력해주세요.");
            return;
        }
        if (!geocoderRef.current) {
            setAddressError("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        geocoderRef.current.addressSearch(searchKeyword, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const { x, y } = result[0];
                const latlng = new window.kakao.maps.LatLng(y, x);
                mapInstance.current.setCenter(latlng);
                mapInstance.current.setLevel(3);
                setMarkerAndAddress(latlng);
            } else {
                setAddressError("검색 결과가 없습니다. 다른 키워드로 검색해주세요.");
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!coords || !roadAddress) {
            setError("주소를 검색하거나 지도를 클릭해서 정비소 위치를 선택해주세요.");
            return;
        }
        if (!isEdit && !businessDoc) {
            setError("사업자등록증 등 증빙 서류를 첨부해주세요.");
            return;
        }

        const fullAddress = detailAddress.trim() ? `${roadAddress} ${detailAddress.trim()}` : roadAddress;

        const payload = {
            name: form.name,
            phone: form.phone,
            description: form.description,
            address: fullAddress,
            latitude: coords.latitude,
            longitude: coords.longitude,
        };

        setSubmitting(true);
        try {
            if (isEdit) {
                await resubmitRepairShop(shop.shopId, payload, businessDoc);
                alert("재등록 신청이 완료되었습니다. 관리자 승인을 기다려주세요.");
            } else {
                await registerRepairShop(payload, businessDoc);
                alert("정비소 등록 신청이 완료되었습니다. 관리자 승인을 기다려주세요.");
            }
            onSuccess();
        } catch (err) {
            const message = err.response?.data?.message || "처리에 실패했습니다.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page" style={{ maxWidth: 480 }}>
            <div className="page-header">
                <span className="eyebrow">MY SHOP</span>
                <h1 style={{ fontSize: 28 }}>{isEdit ? "정비소 수정 및 재등록" : "정비소 등록"}</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label">정비소 이름</label>
                        <input className="input" type="text" name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="field">
                        <label className="field-label">연락처</label>
                        <input className="input" type="text" name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="field">
                        <label className="field-label">소개</label>
                        <textarea className="textarea" name="description" rows={4} value={form.description} onChange={handleChange} />
                    </div>

                    <div className="field">
                        <label className="field-label">위치 선택</label>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                                className="input"
                                type="text"
                                placeholder="주소를 검색하세요 (예: 강남구 테헤란로 123)"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <button type="button" className="btn btn-outline" onClick={handleSearchAddress} style={{ flex: "none" }}>
                                검색
                            </button>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 8 }}>
                            검색 후 지도를 클릭해서 정확한 위치를 미세 조정할 수 있어요.
                        </p>
                        <div ref={mapContainer} className="card" style={{ width: "100%", height: "320px", padding: 0, overflow: "hidden" }} />
                        {addressError && <p className="form-error">{addressError}</p>}
                        {roadAddress && (
                            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-ink)" }}>선택된 위치: {roadAddress}</p>
                        )}
                    </div>

                    <div className="field">
                        <label className="field-label">상세 주소</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="예: 2층 201호"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label">
                            증빙 서류 (사업자등록증 등) {isEdit && "- 변경 시에만 첨부"}
                        </label>
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                        {businessDoc && (
                            <p style={{ marginTop: 6, fontSize: 13, color: "var(--color-ink-soft)" }}>
                                선택된 파일: {businessDoc.name}
                            </p>
                        )}
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="btn btn-outline" onClick={onCancel}>
                            취소
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                            {submitting ? "처리 중..." : isEdit ? "재등록 신청" : "등록 신청"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}