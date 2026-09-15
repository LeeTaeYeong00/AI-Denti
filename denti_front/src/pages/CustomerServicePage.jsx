import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createInquiry, getMyInquiries } from "../api/inquiryAPI";

const TYPE_LABEL = {
    ACCOUNT_SUSPENSION: "계정 정지 이의신청",
    USER_REPORT: "유저 신고",
    OTHER: "기타 문의",
};

export default function CustomerServicePage() {
    const { loginUser } = useAuth();
    const [searchParams] = useSearchParams();

    const reportedUserId = searchParams.get("reportedUserId");
    const reportedPostId = searchParams.get("reportedPostId");
    const isReportMode = !!(reportedUserId || reportedPostId);

    const [type, setType] = useState(isReportMode ? "USER_REPORT" : "OTHER");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [myInquiries, setMyInquiries] = useState([]);

    useEffect(() => {
        if (!loginUser) return;
        loadMyInquiries();
    }, [loginUser]);

    const loadMyInquiries = async () => {
        try {
            const data = await getMyInquiries();
            setMyInquiries(data);
        } catch (err) {
            console.error("내 문의 조회 실패:", err);
        }
    };

    const availableTypes = loginUser
        ? ["ACCOUNT_SUSPENSION", "USER_REPORT", "OTHER"]
        : ["ACCOUNT_SUSPENSION", "OTHER"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 입력해주세요.");
            return;
        }
        if (!loginUser && !guestEmail.trim()) {
            setError("답변받을 이메일을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            await createInquiry({
                type,
                title,
                content,
                guestEmail: loginUser ? undefined : guestEmail,
                reportedUserId: reportedUserId ? Number(reportedUserId) : undefined,
                reportedPostId: reportedPostId ? Number(reportedPostId) : undefined,
            });
            alert("문의가 접수되었습니다.");
            setTitle("");
            setContent("");
            setGuestEmail("");
            if (loginUser) loadMyInquiries();
        } catch (err) {
            setError(err.response?.data || "접수에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page" style={{ maxWidth: 560 }}>
            <div className="page-header">
                <span className="eyebrow">SUPPORT</span>
                <h1 style={{ fontSize: 28 }}>고객센터</h1>
                <p style={{ marginTop: 6 }}>
                    {loginUser
                        ? "계정 관련 문의, 유저 신고 등을 남겨주세요."
                        : "계정 정지 이의신청 등은 비로그인 상태에서도 접수 가능합니다."}
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label">문의 유형</label>
                        <select className="select" value={type} onChange={(e) => setType(e.target.value)} disabled={isReportMode}>
                            {availableTypes.map((t) => (
                                <option key={t} value={t}>
                                    {TYPE_LABEL[t]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isReportMode && (
                        <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 12 }}>
                            신고 대상이 자동으로 첨부되었습니다.
                        </p>
                    )}

                    {!loginUser && (
                        <div className="field">
                            <label className="field-label">답변받을 이메일</label>
                            <input
                                className="input"
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="field">
                        <label className="field-label">제목</label>
                        <input className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="field-label">내용</label>
                        <textarea className="textarea" rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button className="btn btn-primary btn-block" disabled={submitting}>
                        {submitting ? "접수 중..." : "문의 접수"}
                    </button>
                </form>
            </div>

            {loginUser && (
                <>
                    <div className="section-title-row" style={{ marginTop: 32 }}>
                        <h2>내 문의 내역</h2>
                    </div>

                    {myInquiries.length === 0 ? (
                        <div className="empty-state">문의 내역이 없습니다.</div>
                    ) : (
                        myInquiries.map((inq) => (
                            <div className="card" key={inq.inquiryId}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <span style={{ fontSize: 12, color: "var(--color-ink-faint)" }}>
                                            {TYPE_LABEL[inq.type]}
                                        </span>
                                        <h3 style={{ marginTop: 4 }}>{inq.title}</h3>
                                    </div>
                                    <span className={`badge badge-${inq.status.toLowerCase()}`}>
                                        {inq.status === "ANSWERED" ? "답변완료" : "대기중"}
                                    </span>
                                </div>
                                <p style={{ marginTop: 8, fontSize: 14 }}>{inq.content}</p>

                                {inq.answer && (
                                    <div
                                        style={{
                                            marginTop: 12,
                                            padding: 12,
                                            background: "var(--color-surface)",
                                            borderRadius: "var(--radius-sm)",
                                        }}
                                    >
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>답변</p>
                                        <p style={{ fontSize: 14 }}>{inq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}