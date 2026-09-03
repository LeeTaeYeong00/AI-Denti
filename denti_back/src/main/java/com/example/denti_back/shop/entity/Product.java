package com.example.denti_back.shop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    // 상품을 등록한 정비소
    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private RepairShop shop;

    // 상품명
    private String name;

    // 상품 설명
    @Column(length = 1000)
    private String description;

    // 판매 가격
    private Integer price;

    // 재고 수량
    private Integer stock;

    // 상품 판매 여부
    private boolean active;
}