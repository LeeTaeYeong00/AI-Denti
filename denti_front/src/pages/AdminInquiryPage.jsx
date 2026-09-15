import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllInquiries, answerInquiry } from "../api/inquiryAPI";

const TYPE_LABEL = {
    ACCOUNT_SUSPENSION: "계정 정지 이의신청",
    USER_REPORT: "유저 신고",
    OTHER: "기타 문의",
};

export default function AdminInquiryPage() {
    const { loginUser } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [answerDrafts, setAnswerDrafts] = useState({});

    useEffect(() => {
        loadInquiries();
    }, []);

    const loadInquiries = async () => {
        try {
            const data = await getAllInquiries();
            setInquiries(data);
        } catch (err) {
            console.error("문의 목록 조회 실패:", err);
        }
    };

    const handleAnswer = async (inquiryId) => {
        const answer = answerDrafts[inquiryId];
        if (!answer || !answer.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        try {
            await answerInquiry(inquiryId, answer);
            loadInquiries();
        } catch (err) {
            alert("답변 등록에 실패했습니다.");
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
                <h1 style={{ fontSize: 28 }}>고객센터 문의 관리</h1>
            </div>

            {inquiries.length === 0 ? (
                <div className="empty-state">접수된 문의가 없습니다.</div>
            ) : (
                inquiries.map((inq) => (
                    <div className="card" key={inq.inquiryId}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <span style={{ fontSize: 12, color: "var(--color-ink-faint)" }}>
                                    {TYPE_LABEL[inq.type]} · {inq.authorNickName ?? "비회원"}
                                </span>
                                <h3 style={{ marginTop: 4 }}>{inq.title}</h3>
                            </div>
                            <span className={`badge badge-${inq.status.toLowerCase()}`}>
                                {inq.status === "ANSWERED" ? "답변완료" : "대기중"}
                            </span>
                        </div>

                        <p style={{ marginTop: 8, fontSize: 14 }}>{inq.content}</p>

                        {inq.reportedUserNickName && (
                            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-danger)" }}>
                                신고 대상: {inq.reportedUserNickName}
                            </p>
                        )}
                        {inq.reportedPostId && (
                            <p style={{ marginTop: 4, fontSize: 13, color: "var(--color-ink-soft)" }}>
                                관련 게시글 #{inq.reportedPostId}
                            </p>
                        )}

                        {inq.status === "ANSWERED" ? (
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
                        ) : (
                            <div style={{ marginTop: 12 }}>
                                <textarea
                                    className="textarea"
                                    rows={3}
                                    placeholder="답변을 입력하세요"
                                    value={answerDrafts[inq.inquiryId] ?? ""}
                                    onChange={(e) =>
                                        setAnswerDrafts((prev) => ({ ...prev, [inq.inquiryId]: e.target.value }))
                                    }
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ marginTop: 8 }}
                                    onClick={() => handleAnswer(inq.inquiryId)}
                                >
                                    답변 등록
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}