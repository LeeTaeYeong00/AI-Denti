package com.example.denti_back.reservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.reservation.entity.Reservation;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    // 사용자별 예약 조회
    List<Reservation> findByUser_UserId(Long userId);

    // 정비소별 예약 조회
    List<Reservation> findByShop_ShopId(Long shopId);

    boolean existsByUser_UserIdAndAvailableTime_AvailableTimeId(
            Long userId,
            Long availableTimeId
    );
}