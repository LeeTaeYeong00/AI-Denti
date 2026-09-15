import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMessages } from "../api/chatAPI";
import { useChatSocket } from "../hooks/useChatSocket";

export default function ChatRoomPage() {
    const { roomId } = useParams();
    const { loginUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, [roomId]);

    const loadHistory = async () => {
        try {
            const data = await getMessages(roomId);
            setMessages(data);
        } catch (err) {
            console.error("채팅 이력 조회 실패:", err);
        }
    };

    const { connected, sendMessage } = useChatSocket(roomId, (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput("");
    };

    if (!loginUser) {
        return (
            <div className="page">
                <div className="empty-state">로그인 후 이용해주세요.</div>
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: 560 }}>
            <div className="page-header">
                <span className="eyebrow">CHAT</span>
                <h1 style={{ fontSize: 28 }}>문의하기</h1>
                <p style={{ fontSize: 13, color: connected ? "var(--color-success)" : "var(--color-danger)" }}>
                    {connected ? "연결됨" : "연결 중..."}
                </p>
            </div>

            <div
                className="card"
                style={{ height: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}
            >
                {messages.map((m) => {
                    const isMine = m.senderId === loginUser.userId;
                    return (
                        <div
                            key={m.messageId}
                            style={{
                                alignSelf: isMine ? "flex-end" : "flex-start",
                                maxWidth: "70%",
                                background: isMine ? "var(--color-ink)" : "var(--color-surface)",
                                color: isMine ? "#ffffff" : "var(--color-ink)",
                                padding: "8px 12px",
                                borderRadius: 12,
                            }}
                        >
                            {!isMine && (
                                <p style={{ fontSize: 11, marginBottom: 2, opacity: 0.7 }}>{m.senderNickName}</p>
                            )}
                            <p style={{ fontSize: 14, color: "inherit" }}>{m.content}</p>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                    className="input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="메시지를 입력하세요"
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={!connected}>
                    전송
                </button>
            </div>
        </div>
    );
}