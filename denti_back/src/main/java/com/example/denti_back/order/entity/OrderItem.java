package com.example.denti_back.order.entity;

import com.example.denti_back.shop.entity.Product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    // 어떤 주문에 포함된 상품인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 어떤 상품인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 주문 수량
    @Column(nullable = false)
    private Integer quantity;

    // 주문 당시 가격
    @Column(nullable = false)
    private Integer price;
}