package com.example.denti_back.reservation.repository;

import com.example.denti_back.reservation.entity.AvailableTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailableTimeRepository
        extends JpaRepository<AvailableTime, Long> {

    List<AvailableTime> findByShop_ShopIdAndAvailableDate(
            Long shopId,
            LocalDate availableDate
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AvailableTime a WHERE a.availableTimeId = :id")
    Optional<AvailableTime> findByIdForUpdate(@Param("id") Long id);
}