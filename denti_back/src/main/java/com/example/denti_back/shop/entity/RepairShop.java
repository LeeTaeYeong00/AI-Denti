package com.example.denti_back.shop.entity;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class RepairShop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shopId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    private String name;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;
}