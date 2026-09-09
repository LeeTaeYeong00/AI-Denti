package com.example.denti_back.reservation.controller;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.reservation.dto.AvailableTimeBulkRequestDto;
import com.example.denti_back.reservation.dto.AvailableTimeRequestDto;
import com.example.denti_back.reservation.dto.AvailableTimeResponseDto;
import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.service.AvailableTimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/available-times")
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;

    @GetMapping
    public List<AvailableTime> getAvailableTimes() {
        return availableTimeService.getAllAvailableTimes();
    }

    @GetMapping("/shop/{shopId}")
    public List<AvailableTimeResponseDto> getAvailableTimesByShopAndDate(
            @PathVariable Long shopId,
            @RequestParam LocalDate date
    ) {
        return availableTimeService.getAvailableTimesByShopAndDate(shopId, date);
    }

    // 개별 등록 (사장님용)
    @PostMapping
    public AvailableTimeResponseDto createAvailableTime(
            @RequestBody @Valid AvailableTimeRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return availableTimeService.createAvailableTime(userDetails.getUser(), request);
    }

    // 자동 생성 (사장님용)
    @PostMapping("/bulk")
    public List<AvailableTimeResponseDto> createAvailableTimesBulk(
            @RequestBody @Valid AvailableTimeBulkRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return availableTimeService.createAvailableTimesBulk(userDetails.getUser(), request);
    }

    // 정원 수정
    @PutMapping("/{availableTimeId}")
    public AvailableTimeResponseDto updateCapacity(
            @PathVariable Long availableTimeId,
            @RequestBody Map<String, Integer> request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return availableTimeService.updateCapacity(availableTimeId, userDetails.getUser(), request.get("capacity"));
    }

    @DeleteMapping("/{availableTimeId}")
    public void deleteAvailableTime(
            @PathVariable Long availableTimeId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        availableTimeService.deleteAvailableTime(availableTimeId, userDetails.getUser());
    }
}