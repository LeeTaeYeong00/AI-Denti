package com.example.denti_back.chat.controller;

import com.example.denti_back.chat.dto.ChatMessageResponseDto;
import com.example.denti_back.chat.dto.ChatMessageSendDto;
import com.example.denti_back.chat.service.ChatService;
import com.example.denti_back.member.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageSendDto request, Authentication authentication) {
        if (authentication == null) {
            return; // 인증 안 된 연결은 무시
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        ChatMessageResponseDto saved = chatService.saveMessage(
                request.getRoomId(),
                userDetails.getUser(),
                request.getContent()
        );

        messagingTemplate.convertAndSend("/topic/chat.room." + request.getRoomId(), saved);
    }
}