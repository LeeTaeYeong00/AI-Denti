package com.example.denti_back.shop.dto;

import com.example.denti_back.shop.entity.RepairShopAddress;
import lombok.Getter;

@Getter
public class RepairShopAddressResponseDto {

    private Long addressId;
    private Long shopId;
    private String address;
    private Double latitude;
    private Double longitude;
    private String shopName;

    public RepairShopAddressResponseDto(RepairShopAddress address) {
        this.addressId = address.getAddressId();
        this.shopId = address.getRepairShop().getShopId();
        this.address = address.getAddress();
        this.latitude = address.getLatitude();
        this.longitude = address.getLongitude();
        this.shopName = address.getRepairShop().getName();
    }
}