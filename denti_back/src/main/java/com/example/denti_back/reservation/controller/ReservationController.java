package com.example.denti_back.reservation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.reservation.dto.ReservationRequestDto;
import com.example.denti_back.reservation.dto.ReservationResponseDto;
import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.reservation.service.ReservationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponseDto> createReservation(
            @Valid @RequestBody ReservationRequestDto request
    ) {
        Reservation reservation =
                reservationService.createReservation(request);

        return ResponseEntity.ok(
                new ReservationResponseDto(reservation)
        );
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDto>> getReservations() {
        return ResponseEntity.ok(
                reservationService.getReservations()
        );
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ReservationResponseDto> cancelReservation(
            @PathVariable Long reservationId
    ) {
        Reservation reservation =
                reservationService.cancelReservation(reservationId);

        return ResponseEntity.ok(
                new ReservationResponseDto(reservation)
        );
    }

    @PutMapping("/{reservationId}/status")
    public ResponseEntity<ReservationResponseDto> updateReservationStatus(
            @PathVariable Long reservationId,
            @RequestParam ReservationStatus status
    ) {
        Reservation reservation =
                reservationService.updateReservationStatus(
                        reservationId,
                        status
                );

        return ResponseEntity.ok(
                new ReservationResponseDto(reservation)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponseDto>> getReservationsByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                reservationService.getReservationsByUser(userId)
        );
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReservationResponseDto>> getReservationsByShop(
            @PathVariable Long shopId
    ) {
        return ResponseEntity.ok(
                reservationService.getReservationsByShop(shopId)
        );
    }
}