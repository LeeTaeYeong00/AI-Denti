package com.example.denti_back.shop.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.shop.dto.RepairShopUpdateRequestDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairShopService {

    private final RepairShopRepository repairShopRepository;

    @Transactional
    public RepairShop updateRepairShop(
            Long shopId,
            RepairShopUpdateRequestDto request
    ) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        shop.setName(request.getName());
        shop.setPhone(request.getPhone());
        shop.setDescription(request.getDescription());

        if (request.getOpen() != null) {
            shop.setOpen(request.getOpen());
        }

        return shop;
    }
}