package com.example.denti_back.shop.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.entity.RepairShopHour;
import com.example.denti_back.shop.repository.RepairShopHourRepository;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairShopHourService {

    private final RepairShopHourRepository repairShopHourRepository;
    private final RepairShopRepository repairShopRepository;

    // 정비소 영업시간 조회
    public List<RepairShopHour> getShopHours(Long shopId) {

        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        return repairShopHourRepository.findByShop(shop);
    }

    // 정비소 영업시간 등록
    public RepairShopHour createShopHour(
            Long shopId,
            RepairShopHour shopHour
    ) {

        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        shopHour.setShop(shop);

        return repairShopHourRepository.save(shopHour);
    }

    // 정비소 영업시간 전체 삭제
    @Transactional
    public void deleteShopHours(Long shopId) {

        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        repairShopHourRepository.deleteByShop(shop);
    }

    public RepairShopHour updateShopHour(
            Long shopId,
            Long hourId,
            RepairShopHour request
    ) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        RepairShopHour shopHour = repairShopHourRepository.findById(hourId)
                .orElseThrow(() ->
                        new IllegalArgumentException("영업시간을 찾을 수 없습니다."));

        if (!shopHour.getShop().getShopId().equals(shop.getShopId())) {
            throw new IllegalArgumentException(
                    "해당 정비소의 영업시간이 아닙니다."
            );
        }

        shopHour.setDayOfWeek(request.getDayOfWeek());
        shopHour.setOpenTime(request.getOpenTime());
        shopHour.setCloseTime(request.getCloseTime());

        return repairShopHourRepository.save(shopHour);
    }
}