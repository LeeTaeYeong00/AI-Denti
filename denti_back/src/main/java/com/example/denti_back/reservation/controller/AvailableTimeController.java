package com.example.denti_back.reservation.controller;

import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/available-times")
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;

    @GetMapping
    public List<AvailableTime> getAvailableTimes() {
        return availableTimeService.getAllAvailableTimes();
    }

    @PostMapping
    public AvailableTime createAvailableTime(@RequestBody AvailableTime availableTime) {
        return availableTimeService.createAvailableTime(availableTime);
    }

    @GetMapping("/shop/{shopId}")
    public List<AvailableTime> getAvailableTimesByShopAndDate(
            @PathVariable Long shopId,
            @RequestParam LocalDate date
    ) {
        return availableTimeService
                .getAvailableTimesByShopAndDate(shopId, date);
    }

    @PutMapping("/{availableTimeId}")
    public AvailableTime updateAvailableTime(
            @PathVariable Long availableTimeId,
            @RequestBody AvailableTime request
    ) {
        return availableTimeService.updateAvailableTime(
                availableTimeId,
                request
        );
    }

    @DeleteMapping("/{availableTimeId}")
    public void deleteAvailableTime(
            @PathVariable Long availableTimeId
    ) {
        availableTimeService.deleteAvailableTime(availableTimeId);
    }
}