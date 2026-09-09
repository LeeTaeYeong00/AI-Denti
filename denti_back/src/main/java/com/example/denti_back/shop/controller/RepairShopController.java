package com.example.denti_back.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.denti_back.admin.dto.ShopApprovalHistoryResponseDto;
import com.example.denti_back.admin.repository.ShopApprovalHistoryRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.shop.dto.RepairShopRegisterRequestDto;
import com.example.denti_back.shop.dto.RepairShopUpdateRequestDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;
import com.example.denti_back.shop.service.RepairShopService;

import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-shops")
@RequiredArgsConstructor
public class RepairShopController {

        private final RepairShopRepository repairShopRepository;
        private final RepairShopService repairShopService;
        private final ShopApprovalHistoryRepository shopApprovalHistoryRepository;
        
        @PostMapping(consumes = "multipart/form-data")
        public ResponseEntity<RepairShop> registerRepairShop(
                        @RequestPart("data") RepairShopRegisterRequestDto request,
                        @RequestPart("businessDoc") MultipartFile businessDoc) throws IOException {
                User user = getCurrentUser();
                RepairShop shop = repairShopService.registerRepairShop(user, request, businessDoc);
                return ResponseEntity.ok(shop);
        }

        @GetMapping("/my")
        public ResponseEntity<java.util.List<RepairShop>> getMyRepairShops() {
                User user = getCurrentUser();
                return ResponseEntity.ok(repairShopRepository.findByOwner(user));
        }

        @GetMapping("/{shopId}")
        public ResponseEntity<RepairShop> getRepairShop(@PathVariable Long shopId) {
                RepairShop shop = repairShopRepository.findById(shopId)
                                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));
                return ResponseEntity.ok(shop);
        }

        @PutMapping("/{shopId}")
        public ResponseEntity<RepairShop> updateRepairShop(
                        @PathVariable Long shopId,
                        @RequestBody RepairShopUpdateRequestDto request) {
                return ResponseEntity.ok(repairShopService.updateRepairShop(shopId, request));
        }

        // 정비소 삭제 (본인 소유만 가능) - 신규
        @DeleteMapping("/{shopId}")
        public ResponseEntity<Void> deleteRepairShop(@PathVariable Long shopId) {
                User user = getCurrentUser();
                repairShopService.deleteRepairShop(shopId, user);
                return ResponseEntity.noContent().build();
        }

        // 반려된 정비소 수정 후 재등록 (PENDING으로 전환) - 신규
        @PutMapping(value = "/{shopId}/resubmit", consumes = "multipart/form-data")
        public ResponseEntity<RepairShop> resubmitRepairShop(
                        @PathVariable Long shopId,
                        @RequestPart("data") RepairShopRegisterRequestDto request,
                        @RequestPart(value = "businessDoc", required = false) MultipartFile businessDoc)
                        throws IOException {
                User user = getCurrentUser();
                RepairShop shop = repairShopService.resubmitRepairShop(shopId, user, request, businessDoc);
                return ResponseEntity.ok(shop);
        }

        private User getCurrentUser() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                return userDetails.getUser();
        }

        // 정비소 소유자가 자기 정비소의 승인 이력 조회
        @GetMapping("/{shopId}/history")
        public ResponseEntity<List<ShopApprovalHistoryResponseDto>> getMyShopHistory(@PathVariable Long shopId) {
                User user = getCurrentUser();
                RepairShop shop = repairShopRepository.findById(shopId)
                                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

                if (!shop.getOwner().getUserId().equals(user.getUserId())) {
                        throw new IllegalArgumentException("본인 소유의 정비소만 조회할 수 있습니다.");
                }

                List<ShopApprovalHistoryResponseDto> history = shopApprovalHistoryRepository
                                .findByShop_ShopIdOrderByProcessedAtDesc(shopId).stream()
                                .map(ShopApprovalHistoryResponseDto::new)
                                .toList();

                return ResponseEntity.ok(history);
        }
}