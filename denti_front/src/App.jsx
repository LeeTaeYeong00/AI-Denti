import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Main from './pages/Main';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MapPage from './pages/MapPage';
import RepairShopDetailPage from './pages/RepairShopDetailPage';
import AiAnalysisPage from './pages/ai/AiAnalysisPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NavBar />
                <Routes>
                    {/* 메인 / 인증 페이지 */}
                    <Route path="/" element={<Main />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* 지도 및 수리점 도메인 페이지 */}
                    <Route path="/map" element={<MapPage />} />
                    <Route
                        path="/repair-shops/:shopId"
                        element={<RepairShopDetailPage />}
                    />

                    {/* AI 분석 페이지 (보호된 라우트) */}
                    <Route
                        path="/ai"
                        element={
                            <ProtectedRoute>
                                <AiAnalysisPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 팀원들이 각자 도메인 라우트를 여기에 한 줄씩 추가 */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;