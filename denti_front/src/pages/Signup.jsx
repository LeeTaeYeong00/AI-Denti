import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/accountAPI';

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        nickName: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signup(form);
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            navigate('/login');
        } catch (err) {
            const message = err.response?.data?.message || '회원가입에 실패했습니다.';
            setError(message);
        }
    };

    return (
        <div className="page" style={{ maxWidth: 380, paddingTop: 72 }}>
            <div className="card">
                <h2>회원가입</h2>
                <p style={{ marginTop: 4, marginBottom: 24, fontSize: 14 }}>
                    AI-Denti에서 정비 이력을 한 곳에서 관리하세요.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label" htmlFor="signup-username">
                            아이디
                        </label>
                        <input
                            id="signup-username"
                            className="input"
                            type="text"
                            name="username"
                            placeholder="아이디"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label" htmlFor="signup-email">
                            이메일
                        </label>
                        <input
                            id="signup-email"
                            className="input"
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label" htmlFor="signup-password">
                            비밀번호
                        </label>
                        <input
                            id="signup-password"
                            className="input"
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label" htmlFor="signup-name">
                            이름
                        </label>
                        <input
                            id="signup-name"
                            className="input"
                            type="text"
                            name="name"
                            placeholder="이름"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label" htmlFor="signup-nickname">
                            닉네임
                        </label>
                        <input
                            id="signup-nickname"
                            className="input"
                            type="text"
                            name="nickName"
                            placeholder="닉네임"
                            value={form.nickName}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn btn-primary btn-block">
                        가입하기
                    </button>
                </form>

                <p className="form-foot">
                    이미 계정이 있으신가요? <Link to="/login" className="link-accent">로그인</Link>
                </p>
            </div>
        </div>
    );
}