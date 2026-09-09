package com.example.denti_back.reservation.dto;

import com.example.denti_back.reservation.entity.AvailableTime;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
public class AvailableTimeResponseDto {

    private Long availableTimeId;
    private LocalDate availableDate;
    private LocalTime availableTime;
    private int capacity;
    private int reservedCount;
    private boolean full;

    public AvailableTimeResponseDto(AvailableTime a) {
        this.availableTimeId = a.getAvailableTimeId();
        this.availableDate = a.getAvailableDate();
        this.availableTime = a.getAvailableTime();
        this.capacity = a.getCapacity();
        this.reservedCount = a.getReservedCount();
        this.full = a.isFull();
    }
}