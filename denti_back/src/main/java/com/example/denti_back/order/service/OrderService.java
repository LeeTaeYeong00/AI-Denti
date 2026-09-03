package com.example.denti_back.order.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.order.dto.OrderRequestDto;
import com.example.denti_back.order.dto.OrderResponseDto;
import com.example.denti_back.order.entity.Order;
import com.example.denti_back.order.entity.OrderItem;
import com.example.denti_back.order.entity.OrderStatus;
import com.example.denti_back.order.repository.OrderRepository;
import com.example.denti_back.shop.entity.Product;
import com.example.denti_back.shop.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // 주문 생성
    public OrderResponseDto createOrder(
            User user,
            OrderRequestDto request
    ) {

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        int totalPrice = 0;

        for (OrderRequestDto.OrderItemRequestDto itemRequest : request.getItems()) {

            Product product = productRepository.findById(
                    itemRequest.getProductId()
            ).orElseThrow(() ->
                    new IllegalArgumentException("상품을 찾을 수 없습니다.")
            );

            int quantity = itemRequest.getQuantity();

            if (quantity <= 0) {
                throw new IllegalArgumentException(
                        "주문 수량은 1개 이상이어야 합니다."
                );
            }

            if (!product.isActive()) {
                throw new IllegalArgumentException(
                        "판매 중지된 상품입니다."
                );
            }

            if (product.getStock() < quantity) {
                throw new IllegalArgumentException(
                        "재고가 부족합니다."
                );
            }

            int subtotal = product.getPrice() * quantity;

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(quantity);

            order.getItems().add(orderItem);

            product.setStock(product.getStock() - quantity);

            totalPrice += subtotal;
        }

        order.setTotalPrice(totalPrice);

        Order savedOrder = orderRepository.save(order);

        return toResponseDto(savedOrder);
    }

    // 주문 조회
    @Transactional(readOnly = true)
    public OrderResponseDto getOrder(
            Long orderId,
            User user
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "주문을 찾을 수 없습니다."
                        ));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException(
                    "본인의 주문만 조회할 수 있습니다."
            );
        }

        return toResponseDto(order);
    }

    // 내 주문 조회
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(
            User user
    ) {

        return orderRepository.findByUser(user)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    // 주문 취소
    public OrderResponseDto cancelOrder(
            Long orderId,
            User user
    ) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "주문을 찾을 수 없습니다."
                    )
            );

    // 본인 주문인지 확인
    if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException(
                    "본인의 주문만 취소할 수 있습니다."
            );
    }

    // PENDING 상태에서만 취소 가능
    if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "현재 상태에서는 주문을 취소할 수 없습니다."
            );
    }

    // 상품 재고 복구
    for (OrderItem item : order.getItems()) {

            Product product = item.getProduct();

            product.setStock(
                    product.getStock() + item.getQuantity()
            );
    }

    // 주문 상태 변경
    order.setStatus(OrderStatus.CANCELLED);

    return toResponseDto(order);
    }

    // Entity → Response DTO
    private OrderResponseDto toResponseDto(
            Order order
    ) {

        OrderResponseDto response = new OrderResponseDto();

        response.setOrderId(order.getOrderId());
        response.setUserId(order.getUser().getUserId());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus().name());
        response.setCreatedDate(order.getOrderDate());

        List<OrderResponseDto.OrderItemResponseDto> items =
                order.getItems()
                        .stream()
                        .map(item -> {

                            OrderResponseDto.OrderItemResponseDto itemResponse =
                                    new OrderResponseDto.OrderItemResponseDto();

                            itemResponse.setOrderItemId(
                                    item.getOrderItemId()
                            );

                            itemResponse.setProductId(
                                    item.getProduct().getProductId()
                            );

                            itemResponse.setProductName(
                                    item.getProduct().getName()
                            );

                            itemResponse.setPrice(
                                    item.getPrice()
                            );

                            itemResponse.setQuantity(
                                    item.getQuantity()
                            );

                            itemResponse.setSubtotal(
                                    item.getPrice() * item.getQuantity()
                            );

                            return itemResponse;
                        })
                        .toList();

        response.setItems(items);

        return response;
    }
}