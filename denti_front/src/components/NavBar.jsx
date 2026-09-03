import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/accountAPI";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
    const { loginUser, setLoginUser } = useAuth();
    const navigate = useNavigate();
    const isAdmin = loginUser?.role === "ADMIN";

    const handleLogout = async () => {
        await logout();
        setLoginUser(null);
        navigate("/");
    };

    return (
        <header className="site-header">
            <div className="nav-utility">
                <span>
                    {isAdmin ? "관리자 모드" : "AI 기반 차량 파손 진단 · 정비소 예약 플랫폼"}
                </span>

                <div className="nav-utility__links">
                    {loginUser ? (
                        <>
                            <span>
                                {loginUser.nickName}님{isAdmin && " (관리자)"}
                            </span>
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

            <nav className="nav-main">
                <Link to="/" className="nav-main__brand">
                    <span className="nav-main__mark" aria-hidden="true" />
                    AI-Denti
                </Link>

                <div className="nav-main__links">
                    {isAdmin ? (
                        <>
                            <Link to="/admin/repair-shops" className="nav-main__link">정비소 승인 관리</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/map" className="nav-main__link">정비소 지도</Link>
                            {loginUser && (
                                <>
                                    <Link to="/mypage" className="nav-main__link">마이페이지</Link>
                                    <Link to="/my-reservations" className="nav-main__link">내 예약</Link>
                                    <Link to="/my-orders" className="nav-main__link">내 주문</Link>
                                    <Link to="/repair-history" className="nav-main__link">정비 이력</Link>
                                    <Link to="/ai" className="nav-main__link">AI 분석</Link>
                                    <Link to="/my-shop" className="nav-main__link">내 정비소</Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="nav-main__cta">
                    {isAdmin ? (
                        <Link to="/admin/repair-shops">
                            <button className="btn btn-primary">승인 대기 확인</button>
                        </Link>
                    ) : loginUser ? (
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