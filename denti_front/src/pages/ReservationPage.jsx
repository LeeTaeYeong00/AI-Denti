import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ReservationPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const { shopId } = useParams();
    const [date, setDate] = useState("");

    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        if (!date) return;

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

            console.log("ReservationPage 예약시간 조회:", response.data);

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
                    userId: loginUser.userId,
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
        <div className="page" style={{ maxWidth: 560 }}>
            <div className="page-header">
                <span className="eyebrow">RESERVATION</span>
                <h1 style={{ fontSize: 28 }}>예약 신청</h1>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: 4 }}>정비소</h3>
                <p style={{ marginBottom: 20 }}>테스트 정비소</p>

                <div className="field">
                    <label className="field-label" htmlFor="reservation-date">
                        방문 날짜
                    </label>
                    <input
                        id="reservation-date"
                        type="date"
                        className="input"
                        style={{ maxWidth: 220 }}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label className="field-label">예약 가능 시간</label>

                    {availableTimes.length === 0 ? (
                        <p style={{ fontSize: 14 }}>예약 가능한 시간이 없습니다.</p>
                    ) : (
                        <div className="chip-grid">
                            {availableTimes.map((time) => (
                                <button
                                    key={time.availableTimeId}
                                    type="button"
                                    className={`chip ${selectedTime === time.availableTimeId ? "chip--selected" : ""}`}
                                    disabled={time.reserved}
                                    onClick={() => setSelectedTime(time.availableTimeId)}
                                >
                                    {time.availableTime}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p style={{ fontSize: 14, marginTop: 4 }}>
                    선택한 예약 시간:{" "}
                    <strong style={{ color: "var(--color-ink)" }}>
                        {selectedTime
                            ? availableTimes.find(
                                  (time) => time.availableTimeId === selectedTime
                              )?.availableTime
                            : "없음"}
                    </strong>
                </p>

                {!loginUser && (
                    <p className="form-error" style={{ marginTop: 12 }}>
                        로그인 후 예약을 신청할 수 있습니다.
                    </p>
                )}

                <button
                    className="btn btn-primary btn-block"
                    style={{ marginTop: 20 }}
                    disabled={!selectedTime || !loginUser}
                    onClick={createReservation}
                >
                    예약 신청
                </button>
            </div>
        </div>
    );
}

export default ReservationPage;