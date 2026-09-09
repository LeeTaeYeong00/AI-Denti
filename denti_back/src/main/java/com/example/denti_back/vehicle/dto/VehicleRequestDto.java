package com.example.denti_back.vehicle.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleRequestDto {

    private Long userId;
    private String manufacturer;
    private String model;
}