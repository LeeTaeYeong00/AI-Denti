package com.example.denti_back.shop.dto;

import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.entity.RepairShopAddress;
import lombok.Getter;

@Getter
public class PendingShopResponseDto {

    private Long shopId;
    private String name;
    private String phone;
    private String description;
    private String businessDocUrl;
    private String address;
    private Double latitude;
    private Double longitude;

    public PendingShopResponseDto(RepairShop shop, RepairShopAddress address) {
        this.shopId = shop.getShopId();
        this.name = shop.getName();
        this.phone = shop.getPhone();
        this.description = shop.getDescription();
        this.businessDocUrl = shop.getBusinessDocUrl();
        this.address = address != null ? address.getAddress() : null;
        this.latitude = address != null ? address.getLatitude() : null;
        this.longitude = address != null ? address.getLongitude() : null;
    }
}