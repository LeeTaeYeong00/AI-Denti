package com.example.denti_back.shop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RepairItemRequestDto {

    private String name;
    private String description;
    private Integer price;
}