package com.example.denti_back.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AvailableTimeRequestDto {

    @NotNull
    private Long shopId;

    @NotNull
    private LocalDate availableDate;

    @NotNull
    private LocalTime availableTime;

    @Min(1)
    private int capacity;
}