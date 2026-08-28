package com.example.denti_back.shop.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.dto.RepairShopUpdateRequestDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.enums.ApprovalStatus;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairShopService {

    private final RepairShopRepository repairShopRepository;

    // 정비소 등록 신청 (신규 추가)
    @Transactional
    public RepairShop registerRepairShop(User owner, RepairShopUpdateRequestDto request) {
        RepairShop existing = repairShopRepository.findByOwner(owner).orElse(null);

        if (existing != null) {
            if (existing.getApprovalStatus() != ApprovalStatus.REJECTED) {
                throw new IllegalStateException("이미 등록 신청한 정비소가 있습니다.");
            }
            existing.setName(request.getName());
            existing.setPhone(request.getPhone());
            existing.setDescription(request.getDescription());
            existing.setApprovalStatus(ApprovalStatus.PENDING);
            return existing;
        }

        RepairShop shop = new RepairShop();
        shop.setOwner(owner);
        shop.setName(request.getName());
        shop.setPhone(request.getPhone());
        shop.setDescription(request.getDescription());
        shop.setOpen(request.getOpen() != null ? request.getOpen() : true);
        shop.setApprovalStatus(ApprovalStatus.PENDING);

        return repairShopRepository.save(shop);
    }    

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