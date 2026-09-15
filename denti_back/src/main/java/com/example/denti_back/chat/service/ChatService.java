package com.example.denti_back.chat.service;

import com.example.denti_back.chat.dto.ChatMessageResponseDto;
import com.example.denti_back.chat.dto.ChatRoomResponseDto;
import com.example.denti_back.chat.entity.ChatMessage;
import com.example.denti_back.chat.entity.ChatRoom;
import com.example.denti_back.chat.repository.ChatMessageRepository;
import com.example.denti_back.chat.repository.ChatRoomRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RepairShopRepository repairShopRepository;

    @Transactional
    public ChatRoomResponseDto getOrCreateRoom(User user, Long shopId) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        ChatRoom room = chatRoomRepository.findByUser_UserIdAndShop_ShopId(user.getUserId(), shopId)
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setUser(user);
                    newRoom.setShop(shop);
                    return chatRoomRepository.save(newRoom);
                });

        return toResponseDtoWithLastMessage(room);
    }

    public List<ChatRoomResponseDto> getMyRoomsAsUser(Long userId) {
        return chatRoomRepository.findByUser_UserId(userId).stream()
                .map(this::toResponseDtoWithLastMessage)
                .toList();
    }

    public List<ChatRoomResponseDto> getRoomsByShop(Long shopId, User requester) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        if (!shop.getOwner().getUserId().equals(requester.getUserId())) {
            throw new IllegalArgumentException("본인 소유의 정비소만 조회할 수 있습니다.");
        }

        return chatRoomRepository.findByShop_ShopId(shopId).stream()
                .map(this::toResponseDtoWithLastMessage)
                .toList();
    }

    public List<ChatMessageResponseDto> getMessages(Long roomId, User requester) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        boolean isCustomer = room.getUser().getUserId().equals(requester.getUserId());
        boolean isShopOwner = room.getShop().getOwner().getUserId().equals(requester.getUserId());

        if (!isCustomer && !isShopOwner) {
            throw new IllegalArgumentException("채팅방에 접근할 권한이 없습니다.");
        }

        return chatMessageRepository.findByRoom_RoomIdOrderBySentAtAsc(roomId).stream()
                .map(ChatMessageResponseDto::new)
                .toList();
    }

    @Transactional
    public ChatMessageResponseDto saveMessage(Long roomId, User sender, String content) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        boolean isCustomer = room.getUser().getUserId().equals(sender.getUserId());
        boolean isShopOwner = room.getShop().getOwner().getUserId().equals(sender.getUserId());

        if (!isCustomer && !isShopOwner) {
            throw new IllegalArgumentException("채팅방에 메시지를 보낼 권한이 없습니다.");
        }

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(content);

        return new ChatMessageResponseDto(chatMessageRepository.save(message));
    }

    // 채팅방 + 마지막 메시지를 묶어서 DTO로 변환 (목록 화면에서 미리보기용)
    private ChatRoomResponseDto toResponseDtoWithLastMessage(ChatRoom room) {
        var lastMessage = chatMessageRepository.findFirstByRoom_RoomIdOrderBySentAtDesc(room.getRoomId());

        return new ChatRoomResponseDto(
                room,
                lastMessage.map(ChatMessage::getContent).orElse("아직 대화가 없습니다."),
                lastMessage.map(ChatMessage::getSentAt).orElse(room.getCreatedAt())
        );
    }
}