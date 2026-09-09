import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import ReviewWritePage from "./pages/review/ReviewWritePage";
import MyReviewsPage from "./pages/review/MyReviewsPage";
import ShopReviewManagementPage from "./pages/review/ShopReviewManagementPage";
import MyFavoritesPage from "./pages/favorite/MyFavoritesPage";
import OrderPage from "./pages/OrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MyOrderPage from "./pages/MyOrderPage";

// Pages
import Main from "./pages/Main";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MapPage from "./pages/MapPage";
import RepairShopDetailPage from "./pages/RepairShopDetailPage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationPage from "./pages/MyReservationPage";
import RepairHistoryPage from "./pages/RepairHistoryPage";
import VehiclePage from "./pages/VehiclePage";
import ShopReservationPage from "./pages/ShopReservationPage";
import AiAnalysisPage from "./pages/ai/AiAnalysisPage";
import AiHistoryPage from "./pages/ai/AiHistoryPage";
import AiAnalysisDetailPage from "./pages/ai/AiAnalysisDetailPage";
import MyPage from "./pages/MyPage";
import MyShopPage from "./pages/MyShopPage";
import RepairItemPage from "./pages/RepairItemPage";
import RepairItemListPage from "./pages/RepairItemListPage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductListPage from "./pages/ProductListPage";
import AdminShopApprovalPage from "./pages/AdminShopApprovalPage";
import AdminRoute from "./components/AdminRoute";
import AdminUserPage from "./pages/AdminUserPage";
import ManageAvailableTimePage from "./pages/ManageAvailableTimePage";
import ManageShopHourPage from "./pages/ManageShopHourPage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NavBar />
                <Routes>
                    {/* 메인 / 인증 페이지 */}
                    <Route path="/" element={<Main />} />

                    <Route
                        path="/mypage"
                        element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

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
                        path="/my-orders"
                        element={
                            <ProtectedRoute>
                                <MyOrderPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/vehicles"
                        element={
                            <ProtectedRoute>
                                <VehiclePage />
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

                    {/* AI 분석 페이지 */}
                    <Route
                        path="/ai"
                        element={
                            <ProtectedRoute>
                                <AiAnalysisPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 리뷰 */}
                    <Route
                        path="/reviews/write/:reservationId"
                        element={
                            <ProtectedRoute>
                                <ReviewWritePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-reviews"
                        element={
                            <ProtectedRoute>
                                <MyReviewsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-favorites"
                        element={
                            <ProtectedRoute>
                                <MyFavoritesPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 수리점 */}
                    <Route
                        path="/my-shop"
                        element={
                            <ProtectedRoute>
                                <MyShopPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-shop/reviews"
                        element={
                            <ProtectedRoute>
                                <ShopReviewManagementPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 수리 항목 */}
                    <Route
                        path="/repair-items"
                        element={
                            <ProtectedRoute>
                                <RepairItemPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/repair-item-list"
                        element={<RepairItemListPage />}
                    />

                    {/* 상품 */}
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <ProductPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products/:productId"
                        element={<ProductDetailPage />}
                    />

                    <Route
                        path="/products/:productId/order"
                        element={
                            <ProtectedRoute>
                                <OrderPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders/:orderId"
                        element={
                            <ProtectedRoute>
                                <OrderDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/product-list"
                        element={<ProductListPage />}
                    />

                    {/* 관리자 */}
                    <Route
                        path="/admin/repair-shops"
                        element={
                            <AdminRoute>
                                <AdminShopApprovalPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <AdminUserPage />
                            </AdminRoute>
                        }
                    />

                    {/* 수리점 운영 */}
                    <Route
                        path="/manage-available-times"
                        element={
                            <ProtectedRoute>
                                <ManageAvailableTimePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/manage-shop-hours"
                        element={
                            <ProtectedRoute>
                                <ManageShopHourPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;