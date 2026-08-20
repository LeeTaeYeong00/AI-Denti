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
import ReservationPage from './pages/ReservationPage';
import MyReservationPage from './pages/MyReservationPage';
import RepairHistoryPage from './pages/RepairHistoryPage';
import ShopReservationPage from './pages/ShopReservationPage';
import AiAnalysisPage from './pages/ai/AiAnalysisPage';
import AiHistoryPage from './pages/ai/AiHistoryPage';
import AiAnalysisDetailPage from './pages/ai/AiAnalysisDetailPage';


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
                    <Route
                        path="/ai"
                        element={
                            <ProtectedRoute>
                                <AiAnalysisPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai/history"
                        element={
                            <ProtectedRoute>
                                <AiHistoryPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ai/history/:analysisId"
                        element={
                            <ProtectedRoute>
                                <AiAnalysisDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 지도 및 수리점 도메인 페이지 */}
                    <Route path="/map" element={<MapPage />} />
                    <Route
                        path="/repair-shops/:shopId"
                        element={<RepairShopDetailPage />}
                    />

                    <Route
                        path="/repair-shops/:shopId/reservation"
                        element={<ReservationPage />}
                    />

                    <Route
                        path="/my-reservations"
                        element={
                            <ProtectedRoute>
                                <MyReservationPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/repair-history"
                        element={
                            <ProtectedRoute>
                                <RepairHistoryPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/shop-reservations"
                        element={<ShopReservationPage />}
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