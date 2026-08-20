package com.example.denti_back.shop.dto;

import java.time.LocalDateTime;

import com.example.denti_back.shop.entity.RepairHistory;

import lombok.Getter;

@Getter
public class RepairHistoryResponseDto {

    private Long repairHistoryId;

    private Long vehicleId;

    private Long reservationId;

    private Long shopId;

    private Long itemId;

    private String description;

    private Integer repairPrice;

    private LocalDateTime repairedAt;

    public RepairHistoryResponseDto(RepairHistory history) {

        this.repairHistoryId =
                history.getRepairHistoryId();

        this.vehicleId =
                history.getVehicle().getVehicleId();

        this.reservationId =
                history.getReservation().getReservationId();

        this.shopId =
                history.getShop().getShopId();

        this.itemId =
                history.getRepairItem().getItemId();

        this.description =
                history.getDescription();

        this.repairPrice =
                history.getRepairPrice();

        this.repairedAt =
                history.getRepairedAt();
    }
}