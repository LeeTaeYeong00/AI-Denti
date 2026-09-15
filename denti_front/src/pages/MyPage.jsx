import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, getLoginUser } from "../api/accountAPI";
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
    const { loginUser, setLoginUser } = useAuth();

    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(loginUser?.name ?? "");
    const [nickName, setNickName] = useState(loginUser?.nickName ?? "");
    const [profileError, setProfileError] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    const isSocialAccount = loginUser.provider && loginUser.provider !== "LOCAL";

    const startEdit = () => {
        setName(loginUser.name ?? "");
        setNickName(loginUser.nickName ?? "");
        setProfileError("");
        setEditMode(true);
    };

    const handleSaveProfile = async () => {
        setProfileError("");
        if (!name.trim() || !nickName.trim()) {
            setProfileError("이름과 닉네임을 모두 입력해주세요.");
            return;
        }

        setSavingProfile(true);
        try {
            await updateProfile({ name, nickName });
            const user = await getLoginUser();
            setLoginUser(user);
            setEditMode(false);
        } catch (err) {
            setProfileError(err.response?.data || "수정에 실패했습니다.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError("");

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            setPasswordError("모든 항목을 입력해주세요.");
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setPasswordError("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setSavingPassword(true);
        try {
            await changePassword({ currentPassword, newPassword });
            alert("비밀번호가 변경되었습니다.");
            setShowPasswordForm(false);
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirm("");
        } catch (err) {
            setPasswordError(err.response?.data || "변경에 실패했습니다.");
        } finally {
            setSavingPassword(false);
        }
    };

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

                    {!editMode ? (
                        <>
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

                            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                <button className="btn btn-outline btn-sm" onClick={startEdit}>
                                    프로필 수정
                                </button>
                                {!isSocialAccount && (
                                    <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordForm((v) => !v)}>
                                        비밀번호 변경
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="field">
                                <label className="field-label">이름</label>
                                <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="field">
                                <label className="field-label">닉네임</label>
                                <input className="input" type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} />
                            </div>
                            {profileError && <p className="form-error">{profileError}</p>}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={savingProfile}>
                                    {savingProfile ? "저장 중..." : "저장"}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>
                                    취소
                                </button>
                            </div>
                        </div>
                    )}

                    {showPasswordForm && !isSocialAccount && (
                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--color-line)" }}>
                            <h4 style={{ marginBottom: 12, fontSize: 15 }}>비밀번호 변경</h4>
                            <div className="field">
                                <label className="field-label">현재 비밀번호</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label className="field-label">새 비밀번호</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label className="field-label">새 비밀번호 확인</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                />
                            </div>
                            {passwordError && <p className="form-error">{passwordError}</p>}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn btn-primary btn-sm" onClick={handleChangePassword} disabled={savingPassword}>
                                    {savingPassword ? "변경 중..." : "변경하기"}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowPasswordForm(false)}>
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
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