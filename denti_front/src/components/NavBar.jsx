import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/accountAPI';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { loginUser, setLoginUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setLoginUser(null);
        navigate('/');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #ddd' }}>
            <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
                🚗 AI-Denti
            </Link>
            <div>
                {loginUser ? (
                    <>
                        <span style={{ marginRight: '12px' }}>{loginUser.nickName}님</span>
                        <button onClick={handleLogout}>로그아웃</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button>로그인</button></Link>
                        <Link to="/signup" style={{ marginLeft: '8px' }}><button>회원가입</button></Link>
                    </>
                )}
            </div>
        </div>
    );
}