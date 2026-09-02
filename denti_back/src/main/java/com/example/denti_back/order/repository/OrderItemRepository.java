package com.example.denti_back.order.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.order.entity.Order;
import com.example.denti_back.order.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 특정 주문에 포함된 상품 목록
    List<OrderItem> findByOrder(Order order);
}