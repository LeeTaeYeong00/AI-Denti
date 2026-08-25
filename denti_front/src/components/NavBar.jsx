import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/accountAPI";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
    const { loginUser, setLoginUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setLoginUser(null);
        navigate("/");
    };

    return (
        <header className="site-header">
            {/* 상단 얇은 유틸리티 바 */}
            <div className="nav-utility">
                <span>AI 기반 차량 파손 진단 · 정비소 예약 플랫폼</span>

                <div className="nav-utility__links">
                    {loginUser ? (
                        <>
                            <span>{loginUser.nickName}님</span>
                            <button type="button" className="link-plain" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">로그인</Link>
                            <Link to="/signup">회원가입</Link>
                        </>
                    )}
                </div>
            </div>

            {/* 로고 + 큰 메뉴 + CTA */}
            <nav className="nav-main">
                <Link to="/" className="nav-main__brand">
                    <span className="nav-main__mark" aria-hidden="true" />
                    AI-Denti
                </Link>

                <div className="nav-main__links">
                    <Link to="/map" className="nav-main__link">정비소 지도</Link>
                    {loginUser && (
                        <>
                            <Link to="/mypage" className="nav-main__link">마이페이지</Link>
                            <Link to="/my-reservations" className="nav-main__link">내 예약</Link>
                            <Link to="/repair-history" className="nav-main__link">정비 이력</Link>
                            <Link to="/ai" className="nav-main__link">AI 분석</Link>
                        </>
                    )}
                </div>

                <div className="nav-main__cta">
                    {loginUser ? (
                        <Link to="/ai">
                            <button className="btn btn-primary">AI 분석 시작</button>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <button className="btn btn-primary">시작하기</button>
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
