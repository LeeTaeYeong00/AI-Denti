package com.example.denti_back.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.shop.entity.RepairHistory;

public interface RepairHistoryRepository
        extends JpaRepository<RepairHistory, Long> {

    // 특정 차량의 정비 이력
    List<RepairHistory> findByVehicle_VehicleId(Long vehicleId);

    // 특정 사용자의 차량 정비 이력
    List<RepairHistory> findByVehicle_User_UserId(Long userId);

    // 특정 정비소의 정비 이력
    List<RepairHistory> findByShop_ShopId(Long shopId);

    // 특정 예약의 정비 이력
    Optional<RepairHistory> findByReservation_ReservationId(Long reservationId);
}