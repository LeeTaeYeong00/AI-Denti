import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeImage, confirmSaveAnalysis } from "../../api/aiAPI";

const DAMAGE_LABEL_KR = {
    BREAKAGE: "파손",
    CRUSHED: "찌그러짐",
    SCRATCH: "스크래치",
    SEPARATED: "이격",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AiAnalysisPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (selected.size > MAX_FILE_SIZE) {
            setError("이미지 용량은 5MB 이하만 업로드할 수 있습니다.");
            e.target.value = "";
            return;
        }

        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setResult(null);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("이미지를 먼저 선택해주세요.");
            return;
        }
        const formData = new FormData();
        formData.append("image", file);
        setLoading(true);
        setError(null);
        try {
            const data = await analyzeImage(formData);
            setResult(data);
        } catch (err) {
            setError("분석 요청 실패 - 서버 연결 상태를 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 저장 확정 -> 실제 DB 저장 후 이력 페이지로 이동
    const handleSave = async () => {
        setSaving(true);
        try {
            await confirmSaveAnalysis({
                imageUrl: result.imageUrls[0],
                totalCost: result.totalCost,
                details: result.details,
            });
            navigate("/ai/history");
        } catch (err) {
            alert("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    // 취소 -> 사진 다시 선택하는 화면으로 초기화 (서버에는 아무것도 안 남음)
    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="page" style={{ maxWidth: 640 }}>
            <div className="page-header">
                <span className="eyebrow">AI DIAGNOSIS</span>
                <h1 style={{ fontSize: 28 }}>AI 파손 분석</h1>
                <p style={{ marginTop: 6 }}>차량 사진을 올리면 파손 부위와 예상 수리비를 분석해드려요.</p>
            </div>

            {!result && (
                <div className="card" style={{ textAlign: "center" }}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: 20 }} />

                    {previewUrl && (
                        <div className="scan-frame" style={{ marginBottom: 20 }}>
                            <span className="scan-frame__corner scan-frame__corner--tl" />
                            <span className="scan-frame__corner scan-frame__corner--tr" />
                            <span className="scan-frame__corner scan-frame__corner--bl" />
                            <span className="scan-frame__corner scan-frame__corner--br" />
                            <img
                                src={previewUrl}
                                alt="미리보기"
                                style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, display: "block" }}
                            />
                        </div>
                    )}

                    <div>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !file}>
                            {loading ? "분석 중..." : "분석 요청"}
                        </button>
                    </div>

                    {error && <p className="form-error">{error}</p>}
                </div>
            )}

            {result && (
                <div className="card" style={{ textAlign: "left", marginTop: 16 }}>
                    <h3 style={{ marginBottom: 16 }}>분석 결과</h3>

                    {previewUrl && (
                        <div className="scan-frame" style={{ marginBottom: 20 }}>
                            <span className="scan-frame__corner scan-frame__corner--tl" />
                            <span className="scan-frame__corner scan-frame__corner--tr" />
                            <span className="scan-frame__corner scan-frame__corner--bl" />
                            <span className="scan-frame__corner scan-frame__corner--br" />
                            <img
                                src={previewUrl}
                                alt="분석한 사진"
                                style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 8, display: "block", margin: "0 auto" }}
                            />
                        </div>
                    )}

                    <table className="table">
                        <thead>
                            <tr>
                                <th>파손 유형</th>
                                <th className="num">파손 영역(px)</th>
                                <th className="num">파손 비율</th>
                                <th className="num">예상 견적</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.details.map((d) => (
                                <tr key={d.damageType}>
                                    <td>{DAMAGE_LABEL_KR[d.damageType] ?? d.damageType}</td>
                                    <td className="num">{d.pixelArea.toLocaleString()}</td>
                                    <td className="num">{d.damagePercentage}%</td>
                                    <td className="num">{d.estimatedCost.toLocaleString()}원</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p style={{ marginTop: 16, fontSize: 20, fontWeight: 700, textAlign: "right", fontFamily: "var(--font-mono)" }}>
                        총 예상 수리비: {result.totalCost.toLocaleString()}원
                    </p>

                    <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
                        <button className="btn btn-outline" onClick={handleCancel} disabled={saving}>
                            취소
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "저장 중..." : "저장 / 예약하러가기"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}