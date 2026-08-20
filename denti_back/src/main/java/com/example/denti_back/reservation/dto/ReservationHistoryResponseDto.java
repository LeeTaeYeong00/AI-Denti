package com.example.denti_back.reservation.dto;

import java.time.LocalDateTime;

import com.example.denti_back.reservation.entity.ReservationHistory;
import com.example.denti_back.reservation.enums.ReservationStatus;

import lombok.Getter;

@Getter
public class ReservationHistoryResponseDto {

    private Long historyId;

    private Long reservationId;

    private Long userId;

    private Long shopId;

    private Long vehicleId;

    private Long availableTimeId;

    private ReservationStatus status;

    private LocalDateTime changedAt;

    public ReservationHistoryResponseDto(
            ReservationHistory history
    ) {

        this.historyId = history.getHistoryId();

        this.reservationId =
                history.getReservation().getReservationId();

        this.userId =
                history.getReservation().getUser().getUserId();

        this.shopId =
                history.getReservation().getShop().getShopId();

        this.vehicleId =
                history.getReservation().getVehicle().getVehicleId();

        this.availableTimeId =
                history.getReservation()
                        .getAvailableTime()
                        .getAvailableTimeId();

        this.status = history.getStatus();

        this.changedAt = history.getChangedAt();
    }
}