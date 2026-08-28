import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAiHistory } from "../../api/aiAPI";
import { SERVER_BASE_URL } from "../../api/config";

export default function AiHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getAiHistory();
                setHistory(data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <p style={{ textAlign: "center" }}>불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: 640 }}>
            <div className="page-header">
                <span className="eyebrow">AI DIAGNOSIS</span>
                <h1 style={{ fontSize: 28 }}>내 분석 이력</h1>
            </div>

            {history.length === 0 ? (
                <div className="empty-state">아직 분석한 내역이 없습니다.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {history.map((item) => (
                        <Link
                            key={item.analysisId}
                            to={`/ai/history/${item.analysisId}`}
                            className="card card--hover"
                            style={{ display: "flex", gap: 16, alignItems: "center", textDecoration: "none", color: "inherit" }}
                        >
                            {item.thumbnailUrl && (
                                <img
                                    src={`${SERVER_BASE_URL}${item.thumbnailUrl}`}
                                    alt="분석 이미지"
                                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, flex: "none" }}
                                />
                            )}
                            <div>
                                <p style={{ fontSize: 12, color: "var(--color-ink-faint)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                                <p style={{ fontWeight: 700, fontSize: 17, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                                    {item.totalCost.toLocaleString()}원
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
