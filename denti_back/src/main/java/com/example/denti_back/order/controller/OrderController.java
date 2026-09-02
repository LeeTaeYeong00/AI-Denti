package com.example.denti_back.order.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.order.dto.OrderRequestDto;
import com.example.denti_back.order.dto.OrderResponseDto;
import com.example.denti_back.order.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody OrderRequestDto request
    ) {

        System.out.println("주문 사용자 = " + userDetails.getUser());

        return ResponseEntity.ok(
                orderService.createOrder(
                        userDetails.getUser(),
                        request
                )
        );
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                orderService.getOrder(
                        orderId,
                        userDetails.getUser()
                )
        );
    }

    // 내 주문 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                orderService.getMyOrders(
                        userDetails.getUser()
                )
        );
    }

    // 주문 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                orderService.cancelOrder(
                        orderId,
                        userDetails.getUser()
                )
        );
    }
}