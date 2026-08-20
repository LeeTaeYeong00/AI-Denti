package com.example.denti_back.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.shop.entity.RepairItem;
import com.example.denti_back.shop.entity.RepairShop;

public interface RepairItemRepository
        extends JpaRepository<RepairItem, Long> {

    List<RepairItem> findByShop(RepairShop shop);

    List<RepairItem> findByShop_ShopIdAndActiveTrue(Long shopId);
}