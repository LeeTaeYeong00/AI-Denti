package com.example.denti_back.chat.repository;

import com.example.denti_back.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByUser_UserIdAndShop_ShopId(Long userId, Long shopId);
    List<ChatRoom> findByUser_UserId(Long userId);
    List<ChatRoom> findByShop_ShopId(Long shopId);
}