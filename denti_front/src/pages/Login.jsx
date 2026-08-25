import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getLoginUser } from '../api/accountAPI';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { setLoginUser } = useAuth();
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(loginData);
            const user = await getLoginUser();
            setLoginUser(user);
            navigate('/');
        } catch (err) {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="page" style={{ maxWidth: 380, paddingTop: 72 }}>
            <div className="card">
                <h2>로그인</h2>
                <p style={{ marginTop: 4, marginBottom: 24, fontSize: 14 }}>
                    AI-Denti 계정으로 로그인하세요.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label" htmlFor="username">
                            아이디
                        </label>
                        <input
                            id="username"
                            className="input"
                            type="text"
                            name="username"
                            placeholder="아이디를 입력하세요"
                            value={loginData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field">
                        <label className="field-label" htmlFor="password">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            value={loginData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn btn-primary btn-block">
                        로그인
                    </button>
                </form>

                <p className="form-foot">
                    계정이 없으신가요? <Link to="/signup" className="link-accent">회원가입</Link>
                </p>
            </div>
        </div>
    );
}