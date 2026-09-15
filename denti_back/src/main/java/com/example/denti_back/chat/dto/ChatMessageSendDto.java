package com.example.denti_back.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageSendDto {
    private Long roomId;
    private String content;
}