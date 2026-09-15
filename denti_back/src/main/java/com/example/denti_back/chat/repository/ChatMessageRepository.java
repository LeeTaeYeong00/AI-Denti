package com.example.denti_back.chat.repository;

import com.example.denti_back.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoom_RoomIdOrderBySentAtAsc(Long roomId);
    Optional<ChatMessage> findFirstByRoom_RoomIdOrderBySentAtDesc(Long roomId);
}