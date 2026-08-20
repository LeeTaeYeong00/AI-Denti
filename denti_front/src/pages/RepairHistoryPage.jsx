import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRepairHistoriesByUser } from "../api/repairHistoryAPI";

function RepairHistoryPage() {
    const { loginUser } = useAuth();

    const [histories, setHistories] = useState([]);

    useEffect(() => {
        if (!loginUser) return;

        const loadHistories = async () => {
            try {
                const data = await getRepairHistoriesByUser(
                    loginUser.userId
                );

                console.log("내 정비 이력:", data);

                setHistories(data);
            } catch (error) {
                console.error("정비 이력 조회 실패:", error);

                if (error.response) {
                    console.log(
                        "서버 응답:",
                        error.response.data
                    );
                }

                setHistories([]);
            }
        };

        loadHistories();
    }, [loginUser]);

    if (!loginUser) {
        return <div>로그인 후 이용해주세요.</div>;
    }

    return (
        <div>
            <h1>내 정비 이력</h1>

            {histories.length === 0 ? (
                <p>정비 이력이 없습니다.</p>
            ) : (
                histories.map((history) => (
                    <div key={history.repairHistoryId}>
                        <p>
                            정비 이력 번호:{" "}
                            {history.repairHistoryId}
                        </p>

                        <p>
                            차량 ID: {history.vehicleId}
                        </p>

                        <p>
                            예약 번호: {history.reservationId}
                        </p>

                        <p>
                            정비소 ID: {history.shopId}
                        </p>

                        <p>
                            정비 항목 ID: {history.itemId}
                        </p>

                        <p>
                            정비 내용:{" "}
                            {history.description}
                        </p>

                        <p>
                            정비 금액:{" "}
                            {history.repairPrice?.toLocaleString()}원
                        </p>

                        <p>
                            정비일:{" "}
                            {history.repairedAt}
                        </p>

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default RepairHistoryPage;