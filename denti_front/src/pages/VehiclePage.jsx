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

    // 내 차량 조회
    useEffect(() => {
        if (!loginUser) return;

        loadVehicles();
    }, [loginUser]);

    const loadVehicles = async () => {
        try {
            const data = await getMyVehicles(loginUser.userId);

            console.log("내 차량:", data);

            setVehicles(data);
        } catch (error) {
            console.error("차량 조회 실패:", error);
        }
    };

    // 차량 등록
    const handleCreate = async () => {
        if (!manufacturer || !model) {
            alert("제조사와 차량 모델을 입력해주세요.");
            return;
        }

        try {
            await createVehicle({
                userId: loginUser.userId,
                manufacturer: manufacturer,
                model: model,
            });

            alert("차량이 등록되었습니다.");

            setManufacturer("");
            setModel("");

            loadVehicles();
        } catch (error) {
            console.error("차량 등록 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("차량 등록에 실패했습니다.");
        }
    };

    // 수정 시작
    const startEdit = (vehicle) => {
        setEditVehicleId(vehicle.vehicleId);
        setEditManufacturer(vehicle.manufacturer);
        setEditModel(vehicle.model);
    };

    // 수정 취소
    const cancelEdit = () => {
        setEditVehicleId(null);
        setEditManufacturer("");
        setEditModel("");
    };

    // 차량 수정
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

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("차량 수정에 실패했습니다.");
        }
    };

    // 차량 삭제
    const handleDelete = async (vehicleId) => {
        if (!window.confirm("정말 이 차량을 삭제하시겠습니까?")) {
            return;
        }

        try {
            await deleteVehicle(vehicleId);

            alert("차량이 삭제되었습니다.");

            loadVehicles();
        } catch (error) {
            console.error("차량 삭제 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("차량 삭제에 실패했습니다.");
        }
    };

    if (!loginUser) {
        return <div>로그인 후 이용해주세요.</div>;
    }

    return (
        <div>
            <h1>내 차량 관리</h1>

            {/* 차량 등록 */}
            <div>
                <h2>차량 등록</h2>

                <input
                    type="text"
                    placeholder="제조사"
                    value={manufacturer}
                    onChange={(e) =>
                        setManufacturer(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="차량 모델"
                    value={model}
                    onChange={(e) =>
                        setModel(e.target.value)
                    }
                />

                <button onClick={handleCreate}>
                    차량 등록
                </button>
            </div>

            <hr />

            {/* 차량 목록 */}
            <div>
                <h2>내 차량 목록</h2>

                {vehicles.length === 0 ? (
                    <p>등록된 차량이 없습니다.</p>
                ) : (
                    vehicles.map((vehicle) => (
                        <div key={vehicle.vehicleId}>
                            {editVehicleId === vehicle.vehicleId ? (
                                <>
                                    <input
                                        type="text"
                                        value={editManufacturer}
                                        onChange={(e) =>
                                            setEditManufacturer(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <input
                                        type="text"
                                        value={editModel}
                                        onChange={(e) =>
                                            setEditModel(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        onClick={() =>
                                            handleUpdate(
                                                vehicle.vehicleId
                                            )
                                        }
                                    >
                                        저장
                                    </button>

                                    <button
                                        onClick={cancelEdit}
                                    >
                                        취소
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>
                                        차량 번호:{" "}
                                        {vehicle.vehicleId}
                                    </p>

                                    <p>
                                        제조사:{" "}
                                        {vehicle.manufacturer}
                                    </p>

                                    <p>
                                        모델: {vehicle.model}
                                    </p>

                                    <button
                                        onClick={() =>
                                            startEdit(vehicle)
                                        }
                                    >
                                        수정
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                vehicle.vehicleId
                                            )
                                        }
                                    >
                                        삭제
                                    </button>
                                </>
                            )}

                            <hr />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default VehiclePage;