package com.example.denti_back.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.shop.entity.RepairItem;
import com.example.denti_back.shop.entity.RepairShop;

public interface RepairItemRepository
        extends JpaRepository<RepairItem, Long> {

    // 특정 정비소의 전체 판매 품목
    List<RepairItem> findByShop(RepairShop shop);

    // 특정 정비소의 활성화된 판매 품목
    List<RepairItem> findByShop_ShopIdAndActiveTrue(Long shopId);
}