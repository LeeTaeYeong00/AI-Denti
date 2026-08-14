package com.example.denti_back.shop.dto;

import com.example.denti_back.shop.entity.RepairShopAddress;
import lombok.Getter;

@Getter
public class RepairShopAddressResponseDto {

    private Long addressId;
    private String address;
    private Double latitude;
    private Double longitude;

    public RepairShopAddressResponseDto(RepairShopAddress address) {
        this.addressId = address.getAddressId();
        this.address = address.getAddress();
        this.latitude = address.getLatitude();
        this.longitude = address.getLongitude();
    }
}