package com.example.denti_back.admin.entity;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ShopApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private RepairShop shop;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus action; // APPROVED 또는 REJECTED

    @Column(length = 500)
    private String reason; // 반려일 때만 값 있음

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    @CreationTimestamp
    private LocalDateTime processedAt;
}