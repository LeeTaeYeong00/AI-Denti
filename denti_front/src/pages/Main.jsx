import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PromoBanner from "../components/PromoBanner";
import {
    ScanIcon,
    MapPinIcon,
    UserIcon,
    WrenchIcon,
} from "../components/icons";

const SLIDES = [
    {
        eyebrow: "AI-DENTI",
        title: "사진 한 장으로 파손 진단부터 예상 견적까지",
        subtitle: "AI가 파손 부위를 분석하고, 가까운 정비소 예약까지 바로 연결해드려요.",
        cta: "AI 분석 시작하기",
        to: "/ai",
        background: "linear-gradient(135deg, #1b1e24, #2c313a)",
    },
    {
        eyebrow: "EVENT",
        title: "지금 회원가입하면 첫 AI 분석 무료",
        subtitle: "기간 한정으로 첫 진단 리포트를 무료로 받아보세요.",
        cta: "회원가입하기",
        to: "/signup",
        background: "linear-gradient(135deg, var(--color-signal-hover), var(--color-signal))",
    },
];

const FEATURES = [
    { icon: ScanIcon, label: "AI 파손 분석", desc: "사진으로 파손 진단 받기", to: "/ai", tint: "signal", authOnly: true },
    { icon: MapPinIcon, label: "정비소 지도", desc: "내 주변 정비소 찾기", to: "/map", tint: "info" },
    { icon: WrenchIcon, label: "정비 서비스", desc: "정비 항목과 가격 비교하기", to: "/repair-item-list", tint: "ink" },
    { icon: WrenchIcon, label: "부품·용품", desc: "차량 부품과 용품 둘러보기", to: "/product-list", tint: "success" },
    { icon: UserIcon, label: "마이페이지", desc: "예약, 차량, 이력 한눈에", to: "/mypage", tint: "success", authOnly: true },
    { icon: WrenchIcon, label: "내 주문", desc: "주문 내역 확인하기", to: "/my-orders", tint: "info", authOnly: true },
    { icon: WrenchIcon, label: "내 정비소", desc: "정비소 등록 및 예약 관리", to: "/my-shop", tint: "ink", authOnly: true },
];

export default function Main() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const isAdmin = loginUser?.role === "ADMIN";

    // 관리자가 / 로 접속하면 자동으로 승인 관리 페이지로 이동
    useEffect(() => {
        if (isAdmin) {
            navigate("/admin/repair-shops", { replace: true });
        }
    }, [isAdmin, navigate]);

    if (isAdmin) {
        return null;
    }

    return (
        <div className="page page--wide">
            <PromoBanner slides={SLIDES} />

            <div className="section-title-row" style={{ marginTop: 48 }}>
                <div>
                    <span className="eyebrow">SERVICES</span>
                    <h2>바로가기</h2>
                </div>
            </div>

            <div className="feature-grid">
                {FEATURES.map(({ icon: Icon, label, desc, to, tint, authOnly }) => (
                    <Link
                        key={label}
                        to={authOnly && !loginUser ? "/login" : to}
                        className="feature-tile"
                    >
                        <span className={`feature-tile__icon feature-tile__icon--${tint}`}>
                            <Icon />
                        </span>
                        <span className="feature-tile__label">{label}</span>
                        <span className="feature-tile__desc">{desc}</span>
                    </Link>
                ))}
            </div>

            {!loginUser && (
                <p style={{ marginTop: 32, fontSize: 14, textAlign: "center" }}>
                    로그인하시면 예약, AI 분석 등 모든 기능을 이용하실 수 있습니다.
                </p>
            )}
        </div>
    );
}