package com.example.denti_back.shop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.shop.entity.RepairShopHour;
import com.example.denti_back.shop.service.RepairShopHourService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-shops")
@RequiredArgsConstructor
public class RepairShopHourController {

    private final RepairShopHourService repairShopHourService;

    // 정비소 영업시간 조회
    @GetMapping("/{shopId}/hours")
    public ResponseEntity<List<RepairShopHour>> getShopHours(
            @PathVariable Long shopId
    ) {
        return ResponseEntity.ok(
                repairShopHourService.getShopHours(shopId)
        );
    }

    // 정비소 영업시간 등록
    @PostMapping("/{shopId}/hours")
    public ResponseEntity<RepairShopHour> createShopHour(
            @PathVariable Long shopId,
            @RequestBody RepairShopHour shopHour
    ) {
        return ResponseEntity.ok(
                repairShopHourService.createShopHour(shopId, shopHour)
        );
    }

    // 정비소 영업시간 전체 삭제
    @DeleteMapping("/{shopId}/hours")
    public ResponseEntity<Void> deleteShopHours(
            @PathVariable Long shopId
    ) {
        repairShopHourService.deleteShopHours(shopId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{shopId}/hours/{hourId}")
    public ResponseEntity<RepairShopHour> updateShopHour(
            @PathVariable Long shopId,
            @PathVariable Long hourId,
            @RequestBody RepairShopHour shopHour
    ) {
        return ResponseEntity.ok(
                repairShopHourService.updateShopHour(
                        shopId,
                        hourId,
                        shopHour
                )
        );
    }
}