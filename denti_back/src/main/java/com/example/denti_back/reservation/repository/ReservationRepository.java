package com.example.denti_back.reservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser_UserId(Long userId);

    List<Reservation> findByShop_ShopId(Long shopId);

    boolean existsByUser_UserIdAndAvailableTime_AvailableTimeIdAndStatusNot(
            Long userId,
            Long availableTimeId,
            ReservationStatus status
    );
}