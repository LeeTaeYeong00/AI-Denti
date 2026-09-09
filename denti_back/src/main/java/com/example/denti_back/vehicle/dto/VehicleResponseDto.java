package com.example.denti_back.vehicle.dto;

import com.example.denti_back.vehicle.entity.Vehicle;

import lombok.Getter;

@Getter
public class VehicleResponseDto {

    private Long vehicleId;

    private Long userId;

    private String manufacturer;

    private String model;

    public VehicleResponseDto(Vehicle vehicle) {

        this.vehicleId = vehicle.getVehicleId();

        this.userId = vehicle.getUser().getUserId();

        this.manufacturer = vehicle.getManufacturer();

        this.model = vehicle.getModel();
    }
}