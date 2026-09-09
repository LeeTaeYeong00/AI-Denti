package com.example.denti_back.reservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.reservation.entity.ReservationHistory;

public interface ReservationHistoryRepository
        extends JpaRepository<ReservationHistory, Long> {

    List<ReservationHistory>
    findByReservation_ReservationIdOrderByChangedAtAsc(
            Long reservationId
    );
}