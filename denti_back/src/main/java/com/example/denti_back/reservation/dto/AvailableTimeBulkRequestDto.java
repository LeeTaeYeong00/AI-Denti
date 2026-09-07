package com.example.denti_back.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class AvailableTimeBulkRequestDto {

    @NotNull
    private Long shopId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotEmpty
    private List<DayOfWeek> daysOfWeek; // 예: [MONDAY, WEDNESDAY, FRIDAY]

    @NotEmpty
    private List<LocalTime> times; // 예: [09:00, 10:00, 11:00]

    @Min(1)
    private int capacity;
}