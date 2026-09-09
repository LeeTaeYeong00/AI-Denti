package com.example.denti_back.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderRequestDto {

    // 주문할 상품 목록
    private List<OrderItemRequestDto> items;

    @Getter
    @Setter
    public static class OrderItemRequestDto {

        // 상품 ID
        private Long productId;

        // 주문 수량
        private Integer quantity;
    }
}