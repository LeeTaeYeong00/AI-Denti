package com.example.denti_back.chat.controller;

import com.example.denti_back.chat.dto.ChatMessageResponseDto;
import com.example.denti_back.chat.dto.ChatRoomResponseDto;
import com.example.denti_back.chat.service.ChatService;
import com.example.denti_back.member.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatService chatService;

    @PostMapping
    public ChatRoomResponseDto getOrCreateRoom(
            @RequestBody Map<String, Long> request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return chatService.getOrCreateRoom(userDetails.getUser(), request.get("shopId"));
    }

    @GetMapping("/my")
    public List<ChatRoomResponseDto> getMyRooms(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return chatService.getMyRoomsAsUser(userDetails.getUser().getUserId());
    }

    @GetMapping("/shop/{shopId}")
    public List<ChatRoomResponseDto> getRoomsByShop(
            @PathVariable Long shopId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return chatService.getRoomsByShop(shopId, userDetails.getUser());
    }

    @GetMapping("/{roomId}/messages")
    public List<ChatMessageResponseDto> getMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return chatService.getMessages(roomId, userDetails.getUser());
    }
}