import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Main() {
    const { loginUser } = useAuth();

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>AI-Denti</h1>
            <p>AI 기반 차량 파손 분석 및 정비소 예약 플랫폼</p>
            {loginUser ? (
                <Link to="/ai"><button>AI 파손 분석 하러가기</button></Link>
            ) : (
                <p>로그인하시면 AI 분석 기능을 이용하실 수 있습니다.</p>
            )}
        </div>
    );
}