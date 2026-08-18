import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ReservationPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const [shopId] = useState(1);
    const [userId] = useState(1);
    const [date, setDate] = useState("2026-08-20");

    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        getAvailableTimes();
    }, [date]);

    const getAvailableTimes = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/available-times/shop/${shopId}`,
                {
                    params: {
                        date: date
                    }
                }
            );

            setAvailableTimes(response.data);
            setSelectedTime(null);

        } catch (error) {
            console.error("예약 가능 시간 조회 실패:", error);
        }
    };

    const createReservation = async () => {
        if (!loginUser) {
            alert("로그인 후 이용해주세요.");
            navigate("/login");
            return;
        }

        if (!selectedTime) {
            alert("예약 시간을 선택해주세요.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8080/api/reservations",
                {
                    userId: userId,
                    shopId: shopId,
                    availableTimeId: selectedTime
                }
            );

            console.log("예약 성공:", response.data);

            alert("예약이 신청되었습니다.");

            getAvailableTimes();
            setSelectedTime(null);

        } catch (error) {
            console.error("예약 신청 실패:", error);

            if (error.response) {
                console.log("서버 응답:", error.response.data);
            }

            alert("예약 신청에 실패했습니다.");
        }
    };

    return (
        <div>
            <h1>예약 신청</h1>

            <div>
                <h3>정비소</h3>
                <p>테스트 정비소</p>
            </div>

            <div>
                <h3>방문 날짜</h3>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <div>
                <h3>예약 가능 시간</h3>

                {availableTimes.length === 0 ? (
                    <p>예약 가능한 시간이 없습니다.</p>
                ) : (
                    availableTimes.map((time) => (
                        <button
                            key={time.availableTimeId}
                            disabled={time.reserved}
                            onClick={() =>
                                setSelectedTime(time.availableTimeId)
                            }
                        >
                            {time.availableTime}
                        </button>
                    ))
                )}
            </div>

            <div>
                <p>
                    선택한 예약 시간:{" "}
                    {selectedTime
                        ? availableTimes.find(
                              (time) =>
                                  time.availableTimeId === selectedTime
                          )?.availableTime
                        : "없음"}
                </p>
            </div>

            {!loginUser && (
                <p style={{ color: "#c0392b", marginBottom: "10px" }}>
                    로그인 후 예약을 신청할 수 있습니다.
                </p>
            )}

            <button
                disabled={!selectedTime || !loginUser}
                onClick={createReservation}
            >
                예약 신청
            </button>
        </div>
    );
}

export default ReservationPage;