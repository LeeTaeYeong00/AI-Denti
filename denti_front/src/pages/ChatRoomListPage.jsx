import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRooms, getRoomsByShop } from "../api/chatAPI";

export default function ChatRoomListPage() {
    const { loginUser } = useAuth();
    const [searchParams] = useSearchParams();
    const shopId = searchParams.get("shopId");

    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        if (!loginUser) return;
        loadRooms();
    }, [loginUser, shopId]);

    const loadRooms = async () => {
        try {
            const data = shopId ? await getRoomsByShop(shopId) : await getMyRooms();
            setRooms(data);
        } catch (err) {
            console.error("채팅방 목록 조회 실패:", err);
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
        <div className="page" style={{ maxWidth: 480 }}>
            <div className="page-header">
                <span className="eyebrow">CHAT</span>
                <h1 style={{ fontSize: 28 }}>{shopId ? "받은 문의" : "내 문의"}</h1>
            </div>

                {rooms.length === 0 ? (
                    <div className="empty-state">채팅방이 없습니다.</div>
                ) : (
                    rooms.map((room) => (
                        <Link
                            key={room.roomId}
                            to={`/chat/${room.roomId}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div className="card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3>
                                        {shopId ? `문의한 유저: ${room.userNickName}` : room.shopName}
                                    </h3>
                                    <span style={{ fontSize: 12, color: "var(--color-ink-faint)" }}>
                                        {new Date(room.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ marginTop: 6, fontSize: 14, color: "var(--color-ink-soft)" }}>
                                    {room.lastMessage}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
        </div>
    );
}