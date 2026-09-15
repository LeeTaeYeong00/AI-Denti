import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginUser } from "../api/accountAPI";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { setLoginUser } = useAuth();

    useEffect(() => {
        async function checkUser() {
            try {
                const user = await getLoginUser();
                setLoginUser(user);

                if (user?.needsAdditionalInfo) {
                    navigate("/oauth/additional-info");
                } else {
                    navigate("/");
                }
            } catch (err) {
                navigate("/login");
            }
        }
        checkUser();
    }, []);

    return (
        <div className="page" style={{ textAlign: "center", paddingTop: 96 }}>
            <p>로그인 처리 중...</p>
        </div>
    );
}