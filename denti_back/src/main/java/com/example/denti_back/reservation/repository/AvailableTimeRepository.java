package com.example.denti_back.reservation.repository;

import com.example.denti_back.reservation.entity.AvailableTime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AvailableTimeRepository extends JpaRepository<AvailableTime, Long> {

    List<AvailableTime> findByShop_ShopIdAndAvailableDate(
            Long shopId,
            LocalDate availableDate
    );
}