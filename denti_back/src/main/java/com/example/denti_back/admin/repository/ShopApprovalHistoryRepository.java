package com.example.denti_back.admin.repository;

import com.example.denti_back.admin.entity.ShopApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopApprovalHistoryRepository extends JpaRepository<ShopApprovalHistory, Long> {
    List<ShopApprovalHistory> findByShop_ShopIdOrderByProcessedAtDesc(Long shopId);
    List<ShopApprovalHistory> findAllByOrderByProcessedAtDesc();
}