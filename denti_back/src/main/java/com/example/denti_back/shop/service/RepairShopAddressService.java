package com.example.denti_back.shop.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.denti_back.shop.dto.RepairShopAddressResponseDto;
import com.example.denti_back.shop.entity.RepairShopAddress;
import com.example.denti_back.shop.repository.RepairShopAddressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairShopAddressService {

    private final RepairShopAddressRepository repairShopAddressRepository;

    public List<RepairShopAddressResponseDto> getAllAddresses() {

        return repairShopAddressRepository.findAll()
                .stream()
                .map(RepairShopAddressResponseDto::new)
                .toList();
    }

    public RepairShopAddressResponseDto getAddressByShopId(Long shopId) {

        RepairShopAddress address = repairShopAddressRepository
                .findByRepairShop_ShopId(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비소 주소를 찾을 수 없습니다."
                        )
                );

        return new RepairShopAddressResponseDto(address);
    }

    public List<RepairShopAddressResponseDto> getNearbyAddresses(
            Double latitude,
            Double longitude,
            Double distance
    ) {
        return repairShopAddressRepository
                .findNearbyAddresses(latitude, longitude, distance)
                .stream()
                .map(RepairShopAddressResponseDto::new)
                .toList();
    }
}