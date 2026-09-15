package com.example.denti_back.chat.entity;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // 고객

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private RepairShop shop;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}