import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Main from './pages/Main';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AiAnalysisPage from './pages/ai/AiAnalysisPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NavBar />
                <Routes>
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
                    {/* 팀원들이 각자 도메인 라우트를 여기에 한 줄씩 추가 */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;