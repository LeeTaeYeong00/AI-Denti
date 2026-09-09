package com.example.denti_back.reservation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.reservation.dto.ReservationHistoryResponseDto;
import com.example.denti_back.reservation.repository.ReservationHistoryRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reservation-histories")
@RequiredArgsConstructor
public class ReservationHistoryController {

    private final ReservationHistoryRepository reservationHistoryRepository;

    // 전체 예약 이력 조회
    @GetMapping
    public ResponseEntity<List<ReservationHistoryResponseDto>> getAllHistories() {

        return ResponseEntity.ok(
                reservationHistoryRepository.findAll()
                        .stream()
                        .map(ReservationHistoryResponseDto::new)
                        .toList()
        );
    }

    // 특정 예약의 상태 변경 이력 조회
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<ReservationHistoryResponseDto>>
    getHistoriesByReservation(
            @PathVariable Long reservationId
    ) {

        return ResponseEntity.ok(
                reservationHistoryRepository
                        .findByReservation_ReservationIdOrderByChangedAtAsc(
                                reservationId
                        )
                        .stream()
                        .map(ReservationHistoryResponseDto::new)
                        .toList()
        );
    }
}