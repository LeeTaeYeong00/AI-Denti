package com.example.denti_back.chat.dto;

import com.example.denti_back.chat.entity.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponseDto {
    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderNickName;
    private String content;
    private LocalDateTime sentAt;

    public ChatMessageResponseDto(ChatMessage message) {
        this.messageId = message.getMessageId();
        this.roomId = message.getRoom().getRoomId();
        this.senderId = message.getSender().getUserId();
        this.senderNickName = message.getSender().getNickName();
        this.content = message.getContent();
        this.sentAt = message.getSentAt();
    }
}