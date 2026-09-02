package com.example.denti_back.order.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.order.entity.Order;
import com.example.denti_back.member.entity.User;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 특정 회원의 주문 조회
    List<Order> findByUser(User user);
}