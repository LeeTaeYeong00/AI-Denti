package com.example.denti_back.chat.dto;

import com.example.denti_back.chat.entity.ChatRoom;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatRoomResponseDto {
    private Long roomId;
    private Long userId;
    private String userNickName;
    private Long shopId;
    private String shopName;
    private LocalDateTime createdAt;

    private String lastMessage;
    private LocalDateTime lastMessageAt;

    public ChatRoomResponseDto(ChatRoom room, String lastMessage, LocalDateTime lastMessageAt) {
        this.roomId = room.getRoomId();
        this.userId = room.getUser().getUserId();
        this.userNickName = room.getUser().getNickName();
        this.shopId = room.getShop().getShopId();
        this.shopName = room.getShop().getName();
        this.createdAt = room.getCreatedAt();
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
    }
}