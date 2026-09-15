import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { WS_URL } from "../api/chatAPI";

export function useChatSocket(roomId, onMessage) {
    const clientRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/chat.room.${roomId}`, (message) => {
                    onMessage(JSON.parse(message.body));
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [roomId]);

    const sendMessage = (content) => {
        if (!clientRef.current || !connected) return;
        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({ roomId, content }),
        });
    };

    return { connected, sendMessage };
}