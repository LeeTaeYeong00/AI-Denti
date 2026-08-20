package com.example.denti_back.shop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RepairShopUpdateRequestDto {

    private String name;

    private String phone;

    private String description;

    private Boolean open;
}