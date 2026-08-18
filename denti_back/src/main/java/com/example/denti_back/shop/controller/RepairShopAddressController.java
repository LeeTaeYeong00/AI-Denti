package com.example.denti_back.shop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.shop.dto.RepairShopAddressResponseDto;
import com.example.denti_back.shop.service.RepairShopAddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-shop-addresses")
public class RepairShopAddressController {

    private final RepairShopAddressService repairShopAddressService;

    @GetMapping
    public List<RepairShopAddressResponseDto> getAllAddresses() {
        return repairShopAddressService.getAllAddresses();
    }

    @GetMapping("/shop/{shopId}")
    public RepairShopAddressResponseDto getAddressByShopId(
            @PathVariable Long shopId
    ) {
        return repairShopAddressService.getAddressByShopId(shopId);
    }

    @GetMapping("/nearby")
    public List<RepairShopAddressResponseDto> getNearbyAddresses(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double distance
    ) {
        return repairShopAddressService.getNearbyAddresses(
                latitude,
                longitude,
                distance
        );
    }
}