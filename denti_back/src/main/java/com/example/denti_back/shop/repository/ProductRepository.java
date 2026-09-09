package com.example.denti_back.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.shop.entity.Product;
import com.example.denti_back.shop.entity.RepairShop;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    // 특정 정비소의 전체 상품
    List<Product> findByShop(RepairShop shop);

    // 특정 정비소의 판매 중인 상품
    List<Product> findByShop_ShopIdAndActiveTrue(Long shopId);

    // 전체 판매 중인 상품
    List<Product> findByActiveTrue();
}