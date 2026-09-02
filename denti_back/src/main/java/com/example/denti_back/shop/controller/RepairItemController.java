package com.example.denti_back.shop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.denti_back.shop.dto.RepairItemRequestDto;
import com.example.denti_back.shop.entity.RepairItem;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairItemRepository;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-items")
@RequiredArgsConstructor
public class RepairItemController {

    private final RepairItemRepository repairItemRepository;
    private final RepairShopRepository repairShopRepository;

    // 정비소 판매 품목 조회
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<RepairItem>> getItems(
            @PathVariable Long shopId
    ) {
        return ResponseEntity.ok(
                repairItemRepository
                        .findByShop_ShopIdAndActiveTrue(shopId)
        );
    }

        // 전체 정비 항목 조회
        @GetMapping
        public ResponseEntity<List<RepairItem>> getAllItems() {
        return ResponseEntity.ok(
                repairItemRepository.findByActiveTrue()
        );
        }

    // 정비소 판매 품목 등록
    @PostMapping("/shop/{shopId}")
    public ResponseEntity<RepairItem> createItem(
            @PathVariable Long shopId,
            @RequestBody RepairItemRequestDto request
    ) {

        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비소를 찾을 수 없습니다."
                        ));

        RepairItem item = new RepairItem();

        item.setShop(shop);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setActive(true);

        return ResponseEntity.ok(
                repairItemRepository.save(item)
        );
    }

    // 정비소 판매 품목 수정
    @PutMapping("/{itemId}")
    public ResponseEntity<RepairItem> updateItem(
            @PathVariable Long itemId,
            @RequestBody RepairItemRequestDto request
    ) {

        RepairItem item = repairItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비 항목을 찾을 수 없습니다."
                        ));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());

        return ResponseEntity.ok(
                repairItemRepository.save(item)
        );
    }

    // 정비소 판매 품목 비활성화
    @DeleteMapping("/{itemId}")
    public ResponseEntity<String> deleteItem(
            @PathVariable Long itemId
    ) {

        RepairItem item = repairItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비 항목을 찾을 수 없습니다."
                        ));

        item.setActive(false);
        repairItemRepository.save(item);

        return ResponseEntity.ok(
                "판매 품목이 삭제되었습니다."
        );
    }
}