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
        <div style={{ maxWidth: '360px', margin: '40px auto' }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input type="text" name="username" placeholder="아이디" value={form.username} onChange={handleChange} />
                </div>
                <div>
                    <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} />
                </div>
                <div>
                    <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} />
                </div>
                <div>
                    <input type="text" name="name" placeholder="이름" value={form.name} onChange={handleChange} />
                </div>
                <div>
                    <input type="text" name="nickName" placeholder="닉네임" value={form.nickName} onChange={handleChange} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">가입하기</button>
            </form>
            <p>
                이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </p>
        </div>
    );
}