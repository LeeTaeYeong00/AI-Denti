import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, updateUserStatus, withdrawUser } from "../api/adminUserAPI";

const STATUS_LABEL = {
    ACTIVE: "활성",
    SUSPENDED: "정지",
    WITHDRAWN: "탈퇴",
};

const ROLE_LABEL = {
    GENERAL: "일반회원",
    ADMIN: "관리자",
};

export default function AdminUserPage() {
    const { loginUser } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("유저 목록 조회 실패:", err);
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        const actionLabel = newStatus === "SUSPENDED" ? "정지" : "활성화";

        if (!window.confirm(`${user.nickName}님을 ${actionLabel} 처리하시겠습니까?`)) return;

        try {
            await updateUserStatus(user.userId, newStatus);
            loadUsers();
        } catch (err) {
            alert(err.response?.data || "처리에 실패했습니다.");
        }
    };

    const handleWithdraw = async (user) => {
        if (!window.confirm(`${user.nickName}님을 강제 탈퇴 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

        try {
            await withdrawUser(user.userId);
            loadUsers();
        } catch (err) {
            alert(err.response?.data || "처리에 실패했습니다.");
        }
    };

    if (!loginUser || loginUser.role !== "ADMIN") {
        return (
            <div className="page">
                <div className="empty-state">관리자만 접근할 수 있습니다.</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">ADMIN</span>
                <h1 style={{ fontSize: 28 }}>회원 관리</h1>
            </div>

            {users.length === 0 ? (
                <div className="empty-state">등록된 회원이 없습니다.</div>
            ) : (
                users.map((user) => (
                    <div className="card" key={user.userId}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                            <div>
                                <h3 style={{ marginBottom: 4 }}>
                                    {user.nickName} ({user.username})
                                </h3>
                                <p style={{ fontSize: 14 }}>{user.email}</p>
                                <p style={{ fontSize: 13, marginTop: 4, color: "var(--color-ink-soft)" }}>
                                    {ROLE_LABEL[user.role] ?? user.role} · {user.provider}
                                </p>
                            </div>
                            <span className={`badge badge-${user.status?.toLowerCase()}`}>
                                {STATUS_LABEL[user.status] ?? user.status}
                            </span>
                        </div>

                        {user.role !== "ADMIN" && user.status !== "WITHDRAWN" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                <button
                                    className={`btn btn-sm ${user.status === "ACTIVE" ? "btn-outline" : "btn-primary"}`}
                                    onClick={() => handleToggleStatus(user)}
                                >
                                    {user.status === "ACTIVE" ? "정지" : "활성화"}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(user)}>
                                    강제 탈퇴
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}