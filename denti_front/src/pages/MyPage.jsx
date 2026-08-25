import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    CarIcon,
    CalendarIcon,
    FileIcon,
    HistoryIcon,
    UserIcon,
} from "../components/icons";

const MENU = [
    { icon: CarIcon, label: "내 차량 관리", desc: "등록한 차량 확인 및 관리", to: "/vehicles", tint: "info" },
    { icon: CalendarIcon, label: "내 예약 내역", desc: "예약 현황 확인하기", to: "/my-reservations", tint: "success" },
    { icon: FileIcon, label: "정비 이력", desc: "지난 정비 기록 보기", to: "/repair-history", tint: "pending" },
    { icon: HistoryIcon, label: "AI 분석 이력", desc: "지난 분석 결과 다시보기", to: "/ai/history", tint: "danger" },
];

export default function MyPage() {
    const { loginUser } = useAuth();

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    return (
        <div className="page page--wide">
            <div className="page-header">
                <span className="eyebrow">MY PAGE</span>
                <h1 style={{ fontSize: 28 }}>마이페이지</h1>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span className="feature-tile__icon feature-tile__icon--ink" style={{ width: 56, height: 56, flex: "none" }}>
                    <UserIcon />
                </span>

                <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: 10 }}>{loginUser.nickName}</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--color-ink-soft)", width: 56 }}>아이디</span>
                            <span>{loginUser.username ?? "-"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--color-ink-soft)", width: 56 }}>이름</span>
                            <span>{loginUser.name ?? "-"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--color-ink-soft)", width: 56 }}>이메일</span>
                            <span>{loginUser.email}</span>
                        </div>
                    </div>

                    <p style={{ marginTop: 12, fontSize: 12, color: "var(--color-ink-faint)" }}>
                        계정 정보 수정 기능은 준비 중입니다.
                    </p>
                </div>
            </div>

            <div className="section-title-row" style={{ marginTop: 32 }}>
                <div>
                    <span className="eyebrow">MENU</span>
                    <h2>바로가기</h2>
                </div>
            </div>

            <div className="feature-grid">
                {MENU.map(({ icon: Icon, label, desc, to, tint }) => (
                    <Link key={label} to={to} className="feature-tile">
                        <span className={`feature-tile__icon feature-tile__icon--${tint}`}>
                            <Icon />
                        </span>
                        <span className="feature-tile__label">{label}</span>
                        <span className="feature-tile__desc">{desc}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}