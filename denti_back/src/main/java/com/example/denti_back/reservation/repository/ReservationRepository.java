package com.example.denti_back.reservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.reservation.entity.Reservation;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {
}