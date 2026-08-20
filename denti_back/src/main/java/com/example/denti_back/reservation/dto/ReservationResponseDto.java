package com.example.denti_back.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;

import lombok.Getter;

@Getter
public class ReservationResponseDto {

    private Long reservationId;

    private Long userId;
    private Long vehicleId;
    private Long shopId;

    private Long availableTimeId;
    private LocalDate availableDate;
    private LocalTime availableTime;

    private ReservationStatus status;

    public ReservationResponseDto(Reservation reservation) {

        this.reservationId = reservation.getReservationId();

        this.userId = reservation.getUser().getUserId();

        this.vehicleId =
                reservation.getVehicle() != null
                        ? reservation.getVehicle().getVehicleId()
                        : null;

        this.shopId = reservation.getShop().getShopId();

        this.availableTimeId =
                reservation.getAvailableTime().getAvailableTimeId();

        this.availableDate =
                reservation.getAvailableTime().getAvailableDate();

        this.availableTime =
                reservation.getAvailableTime().getAvailableTime();

        this.status = reservation.getStatus();
    }
}