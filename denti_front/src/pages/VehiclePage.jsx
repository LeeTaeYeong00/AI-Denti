import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    createVehicle,
    getMyVehicles,
    updateVehicle,
    deleteVehicle,
} from "../api/vehicleAPI";

function VehiclePage() {
    const { loginUser } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [manufacturer, setManufacturer] = useState("");
    const [model, setModel] = useState("");

    const [editVehicleId, setEditVehicleId] = useState(null);
    const [editManufacturer, setEditManufacturer] = useState("");
    const [editModel, setEditModel] = useState("");

    useEffect(() => {
        if (!loginUser) return;
        loadVehicles();
    }, [loginUser]);

    const loadVehicles = async () => {
        try {
            const data = await getMyVehicles(loginUser.userId);
            setVehicles(data);
        } catch (error) {
            console.error("차량 조회 실패:", error);
        }
    };

    const handleCreate = async () => {
        if (!manufacturer || !model) {
            alert("제조사와 차량 모델을 입력해주세요.");
            return;
        }
        try {
            await createVehicle({
                userId: loginUser.userId,
                manufacturer,
                model,
            });
            alert("차량이 등록되었습니다.");
            setManufacturer("");
            setModel("");
            loadVehicles();
        } catch (error) {
            console.error("차량 등록 실패:", error);
            alert("차량 등록에 실패했습니다.");
        }
    };

    const startEdit = (vehicle) => {
        setEditVehicleId(vehicle.vehicleId);
        setEditManufacturer(vehicle.manufacturer);
        setEditModel(vehicle.model);
    };

    const cancelEdit = () => {
        setEditVehicleId(null);
        setEditManufacturer("");
        setEditModel("");
    };

    const handleUpdate = async (vehicleId) => {
        if (!editManufacturer || !editModel) {
            alert("제조사와 차량 모델을 입력해주세요.");
            return;
        }
        try {
            await updateVehicle(vehicleId, {
                userId: loginUser.userId,
                manufacturer: editManufacturer,
                model: editModel,
            });
            alert("차량 정보가 수정되었습니다.");
            cancelEdit();
            loadVehicles();
        } catch (error) {
            console.error("차량 수정 실패:", error);
            alert("차량 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!window.confirm("정말 이 차량을 삭제하시겠습니까?")) return;
        try {
            await deleteVehicle(vehicleId);
            alert("차량이 삭제되었습니다.");
            loadVehicles();
        } catch (error) {
            console.error("차량 삭제 실패:", error);
            alert("차량 삭제에 실패했습니다.");
        }
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: 640 }}>
            <div className="page-header">
                <span className="eyebrow">MY GARAGE</span>
                <h1 style={{ fontSize: 28 }}>내 차량 관리</h1>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16 }}>차량 등록</h2>

                <div className="field">
                    <label className="field-label" htmlFor="vehicle-manufacturer">제조사</label>
                    <input
                        id="vehicle-manufacturer"
                        className="input"
                        type="text"
                        placeholder="예: 현대"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label className="field-label" htmlFor="vehicle-model">차량 모델</label>
                    <input
                        id="vehicle-model"
                        className="input"
                        type="text"
                        placeholder="예: 아반떼"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />
                </div>

                <button className="btn btn-primary" onClick={handleCreate}>
                    차량 등록
                </button>
            </div>

            <div className="section-title-row" style={{ marginTop: 32 }}>
                <h2>내 차량 목록</h2>
            </div>

            {vehicles.length === 0 ? (
                <div className="empty-state">등록된 차량이 없습니다.</div>
            ) : (
                vehicles.map((vehicle) => (
                    <div className="card" key={vehicle.vehicleId}>
                        {editVehicleId === vehicle.vehicleId ? (
                            <>
                                <div className="field">
                                    <label className="field-label">제조사</label>
                                    <input
                                        className="input"
                                        type="text"
                                        value={editManufacturer}
                                        onChange={(e) => setEditManufacturer(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label">차량 모델</label>
                                    <input
                                        className="input"
                                        type="text"
                                        value={editModel}
                                        onChange={(e) => setEditModel(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(vehicle.vehicleId)}>
                                        저장
                                    </button>
                                    <button className="btn btn-outline btn-sm" onClick={cancelEdit}>
                                        취소
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                <div>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-faint)", marginBottom: 6 }}>
                                        차량 #{vehicle.vehicleId}
                                    </p>
                                    <h3>{vehicle.manufacturer} · {vehicle.model}</h3>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(vehicle)}>
                                        수정
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vehicle.vehicleId)}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default VehiclePage;