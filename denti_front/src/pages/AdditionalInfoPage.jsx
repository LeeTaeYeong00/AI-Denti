import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { axiosConfig } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { getLoginUser } from "../api/accountAPI";

const api = axios.create(axiosConfig);

export default function AdditionalInfoPage() {
    const navigate = useNavigate();
    const { setLoginUser } = useAuth();
    const [form, setForm] = useState({ username: "", nickName: "", name: "", email: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.nickName.trim() || !form.name.trim() || !form.email.trim()) {
            setError("모든 항목을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/api/auth/complete-profile", form);
            const user = await getLoginUser();
            setLoginUser(user);
            alert("가입되었습니다.");
            navigate("/");
        } catch (err) {
            setError(err.response?.data || "저장에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div className="page" style={{ maxWidth: 380, paddingTop: 72 }}>
            <div className="card">
                <h2>추가 정보 입력</h2>
                <p style={{ marginTop: 4, marginBottom: 24, fontSize: 14 }}>
                    서비스 이용을 위해 몇 가지 정보를 더 입력해주세요.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label">이름</label>
                        <input
                            className="input"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="field">
                        <label className="field-label">닉네임</label>
                        <input
                            className="input"
                            type="text"
                            name="nickName"
                            value={form.nickName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="field">
                        <label className="field-label">이메일</label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                        {submitting ? "저장 중..." : "완료"}
                    </button>
                </form>
            </div>
        </div>
    );
}