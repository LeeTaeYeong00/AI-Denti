package com.example.denti_back.shop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.shop.dto.RepairHistoryResponseDto;
import com.example.denti_back.shop.entity.RepairHistory;
import com.example.denti_back.shop.service.RepairHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-histories")
@RequiredArgsConstructor
public class RepairHistoryController {

    private final RepairHistoryService repairHistoryService;

    // 전체 정비 이력 조회
    @GetMapping
    public ResponseEntity<List<RepairHistoryResponseDto>> getAllHistories() {

        return ResponseEntity.ok(
                repairHistoryService.getAllRepairHistories()
                        .stream()
                        .map(RepairHistoryResponseDto::new)
                        .toList()
        );
    }

    // 정비 이력 생성
    @PostMapping
    public ResponseEntity<RepairHistoryResponseDto> createRepairHistory(
            @RequestParam Long reservationId,
            @RequestParam String description,
            @RequestParam Integer repairPrice
    ) {

        RepairHistory repairHistory =
                repairHistoryService.createRepairHistory(
                        reservationId,
                        description,
                        repairPrice
                );

        return ResponseEntity.ok(
                new RepairHistoryResponseDto(repairHistory)
        );
    }

    // 차량별 정비 이력 조회
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<RepairHistoryResponseDto>> getHistoriesByVehicle(
            @PathVariable Long vehicleId
    ) {

        return ResponseEntity.ok(
                repairHistoryService
                        .getRepairHistoriesByVehicle(vehicleId)
                        .stream()
                        .map(RepairHistoryResponseDto::new)
                        .toList()
        );
    }

    // 사용자별 정비 이력 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RepairHistoryResponseDto>> getHistoriesByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                repairHistoryService
                        .getRepairHistoriesByUser(userId)
                        .stream()
                        .map(RepairHistoryResponseDto::new)
                        .toList()
        );
    }

    // 정비소별 정비 이력 조회
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<RepairHistoryResponseDto>> getHistoriesByShop(
            @PathVariable Long shopId
    ) {

        return ResponseEntity.ok(
                repairHistoryService
                        .getRepairHistoriesByShop(shopId)
                        .stream()
                        .map(RepairHistoryResponseDto::new)
                        .toList()
        );
    }

    // 예약별 정비 이력 조회
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<RepairHistoryResponseDto> getHistoryByReservation(
            @PathVariable Long reservationId
    ) {

        return ResponseEntity.ok(
                new RepairHistoryResponseDto(
                        repairHistoryService
                                .getRepairHistoryByReservation(reservationId)
                )
        );
    }
}