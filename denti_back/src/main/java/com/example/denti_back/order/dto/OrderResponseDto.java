package com.example.denti_back.order.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponseDto {

    private Long orderId;

    private Long userId;

    private Integer totalPrice;

    private String status;

    private LocalDateTime createdDate;

    private List<OrderItemResponseDto> items;

    @Getter
    @Setter
    public static class OrderItemResponseDto {

        private Long orderItemId;

        private Long productId;

        private String productName;

        private Integer price;

        private Integer quantity;

        private Integer subtotal;
    }
}