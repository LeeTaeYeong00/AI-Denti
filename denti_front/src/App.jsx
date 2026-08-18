import { BrowserRouter, Routes, Route } from "react-router-dom";

import MapPage from "./pages/MapPage";
import RepairShopDetailPage from "./pages/RepairShopDetailPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MapPage />} />

                <Route
                    path="/repair-shops/:shopId"
                    element={<RepairShopDetailPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;