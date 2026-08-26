package com.example.denti_back.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.shop.dto.RepairShopUpdateRequestDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;
import com.example.denti_back.shop.service.RepairShopService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-shops")
@RequiredArgsConstructor
public class RepairShopController {

        private final RepairShopRepository repairShopRepository;
        private final RepairShopService repairShopService;

        // 정비소 등록 신청 (신규 추가)
        @PostMapping
        public ResponseEntity<RepairShop> registerRepairShop(
                @RequestBody RepairShopUpdateRequestDto request
        ) {
                Authentication authentication =
                        SecurityContextHolder.getContext().getAuthentication();

                CustomUserDetails userDetails =
                        (CustomUserDetails) authentication.getPrincipal();

                User user = userDetails.getUser();

                RepairShop shop = repairShopService.registerRepairShop(user, request);
    
                return ResponseEntity.ok(shop);
        }

        // 로그인한 사용자의 정비소 조회
        @GetMapping("/my")
        public ResponseEntity<RepairShop> getMyRepairShop() {

                Authentication authentication =
                        SecurityContextHolder.getContext().getAuthentication();

                CustomUserDetails userDetails =
                        (CustomUserDetails) authentication.getPrincipal();

                User user = userDetails.getUser();

                RepairShop shop = repairShopRepository
                        .findByOwner(user)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "정비소 정보를 찾을 수 없습니다."
                                )
                        );

                return ResponseEntity.ok(shop);
        }

        // 정비소 상세 조회
        @GetMapping("/{shopId}")
        public ResponseEntity<RepairShop> getRepairShop(
                @PathVariable Long shopId
        ) {

                RepairShop shop = repairShopRepository
                        .findById(shopId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "정비소를 찾을 수 없습니다."
                                )
                        );

                return ResponseEntity.ok(shop);
        }

        // 정비소 정보 수정
        @PutMapping("/{shopId}")
        public ResponseEntity<RepairShop> updateRepairShop(
                @PathVariable Long shopId,
                @RequestBody RepairShopUpdateRequestDto request
        ) {

                return ResponseEntity.ok(
                        repairShopService.updateRepairShop(
                                shopId,
                                request
                        )
                );
        }
}