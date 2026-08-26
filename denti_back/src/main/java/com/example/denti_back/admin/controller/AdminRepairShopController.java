package com.example.denti_back.admin.controller;

import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.enums.ApprovalStatus;
import com.example.denti_back.shop.repository.RepairShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/repair-shops")
@RequiredArgsConstructor
public class AdminRepairShopController {

    private final RepairShopRepository repairShopRepository;

    // 승인 대기 중인 정비소 목록
    @GetMapping("/pending")
    public List<RepairShop> getPendingShops() {
        return repairShopRepository.findByApprovalStatus(ApprovalStatus.PENDING);
    }

    // 정비소 승인
    @PutMapping("/{shopId}/approve")
    @Transactional
    public RepairShop approve(@PathVariable Long shopId) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));
        shop.setApprovalStatus(ApprovalStatus.APPROVED);
        return shop;
    }

    // 정비소 반려
    @PutMapping("/{shopId}/reject")
    @Transactional
    public RepairShop reject(@PathVariable Long shopId) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));
        shop.setApprovalStatus(ApprovalStatus.REJECTED);
        return shop;
    }
}