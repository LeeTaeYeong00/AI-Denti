import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { loginUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page" style={{ textAlign: "center", paddingTop: 96 }}>
                <p>확인 중...</p>
            </div>
        );
    }

    if (!loginUser) return <Navigate to="/login" replace />;

    return children;
}
