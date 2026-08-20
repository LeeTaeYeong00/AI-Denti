package com.example.denti_back.shop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class RepairItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private RepairShop shop;

    private String name;

    private String description;

    private Integer price;

    private Integer estimatedMinutes;

    private boolean active;
}