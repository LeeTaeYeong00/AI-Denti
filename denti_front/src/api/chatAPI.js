import axios from "axios";
import { axiosConfig, SERVER_BASE_URL } from "./config";

const api = axios.create(axiosConfig);

export const getOrCreateRoom = async (shopId) => {
    const response = await api.post("/api/chat/rooms", { shopId });
    return response.data;
};

export const getMyRooms = async () => {
    const response = await api.get("/api/chat/rooms/my");
    return response.data;
};

export const getRoomsByShop = async (shopId) => {
    const response = await api.get(`/api/chat/rooms/shop/${shopId}`);
    return response.data;
};

export const getMessages = async (roomId) => {
    const response = await api.get(`/api/chat/rooms/${roomId}/messages`);
    return response.data;
};

export const WS_URL = SERVER_BASE_URL.replace("http", "ws") + "/ws-chat";