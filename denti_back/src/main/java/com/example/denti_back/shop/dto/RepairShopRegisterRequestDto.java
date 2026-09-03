package com.example.denti_back.shop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RepairShopRegisterRequestDto {

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String description;

    @NotBlank
    private String address;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}