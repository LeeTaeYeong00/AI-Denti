package com.example.denti_back.admin.controller;

import com.example.denti_back.admin.dto.RejectShopRequestDto;
import com.example.denti_back.admin.dto.ShopApprovalHistoryResponseDto;
import com.example.denti_back.admin.entity.ShopApprovalHistory;
import com.example.denti_back.admin.repository.ShopApprovalHistoryRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.shop.dto.PendingShopResponseDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.entity.RepairShopAddress;
import com.example.denti_back.shop.enums.ApprovalStatus;
import com.example.denti_back.shop.repository.RepairShopAddressRepository;
import com.example.denti_back.shop.repository.RepairShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/repair-shops")
@RequiredArgsConstructor
public class AdminRepairShopController {

    private final RepairShopRepository repairShopRepository;
    private final RepairShopAddressRepository repairShopAddressRepository;
    private final ShopApprovalHistoryRepository shopApprovalHistoryRepository;

    @GetMapping("/pending")
    public List<PendingShopResponseDto> getPendingShops() {
        List<RepairShop> shops = repairShopRepository.findByApprovalStatus(ApprovalStatus.PENDING);

        return shops.stream()
                .map(shop -> {
                    RepairShopAddress address = repairShopAddressRepository
                            .findByRepairShop_ShopId(shop.getShopId())
                            .orElse(null);
                    return new PendingShopResponseDto(shop, address);
                })
                .toList();
    }

    @PutMapping("/{shopId}/approve")
    @Transactional
    public RepairShop approve(@PathVariable Long shopId, @AuthenticationPrincipal CustomUserDetails adminDetails) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        shop.setApprovalStatus(ApprovalStatus.APPROVED);
        shop.setRejectReason(null);

        saveHistory(shop, ApprovalStatus.APPROVED, null, adminDetails.getUser());

        return shop;
    }

    @PutMapping("/{shopId}/reject")
    @Transactional
    public RepairShop reject(
            @PathVariable Long shopId,
            @RequestBody RejectShopRequestDto request,
            @AuthenticationPrincipal CustomUserDetails adminDetails
    ) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        shop.setApprovalStatus(ApprovalStatus.REJECTED);
        shop.setRejectReason(request.getReason());

        saveHistory(shop, ApprovalStatus.REJECTED, request.getReason(), adminDetails.getUser());

        return shop;
    }

    // 특정 정비소의 승인/반려 이력 조회
    @GetMapping("/{shopId}/history")
    public List<ShopApprovalHistoryResponseDto> getHistory(@PathVariable Long shopId) {
        return shopApprovalHistoryRepository.findByShop_ShopIdOrderByProcessedAtDesc(shopId).stream()
                .map(ShopApprovalHistoryResponseDto::new)
                .toList();
    }

    private void saveHistory(RepairShop shop, ApprovalStatus action, String reason, User admin) {
        ShopApprovalHistory history = new ShopApprovalHistory();
        history.setShop(shop);
        history.setAction(action);
        history.setReason(reason);
        history.setAdmin(admin);
        shopApprovalHistoryRepository.save(history);
    }

    // 전체 승인/반려 이력 조회 (최신순)
    @GetMapping("/history")
    public List<ShopApprovalHistoryResponseDto> getAllHistory() {
        return shopApprovalHistoryRepository.findAllByOrderByProcessedAtDesc().stream()
                .map(ShopApprovalHistoryResponseDto::new)
                .toList();
    }
}