package com.example.denti_back.shop.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.reservation.repository.ReservationRepository;
import com.example.denti_back.shop.entity.RepairHistory;
import com.example.denti_back.shop.repository.RepairHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairHistoryService {

    private final RepairHistoryRepository repairHistoryRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public RepairHistory createRepairHistory(
            Long reservationId,
            String description,
            Integer repairPrice
    ) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        if (reservation.getStatus() != ReservationStatus.COMPLETED) {
            throw new IllegalStateException(
                    "완료된 예약만 정비 이력을 등록할 수 있습니다."
            );
        }

        if (repairHistoryRepository
                .findByReservation_ReservationId(reservationId)
                .isPresent()) {

            throw new IllegalStateException(
                    "이미 해당 예약의 정비 이력이 존재합니다."
            );
        }

        RepairHistory repairHistory = new RepairHistory();

        repairHistory.setReservation(reservation);
        repairHistory.setVehicle(reservation.getVehicle());
        repairHistory.setShop(reservation.getShop());
        repairHistory.setRepairItem(reservation.getRepairItem());

        repairHistory.setDescription(description);
        repairHistory.setRepairPrice(repairPrice);
        repairHistory.setRepairedAt(LocalDateTime.now());

        return repairHistoryRepository.save(repairHistory);
    }


    // ⭐ 전체
    @Transactional(readOnly = true)
    public List<RepairHistory> getAllRepairHistories() {
        return repairHistoryRepository.findAll();
    }


    // ⭐ 사용자별
    @Transactional(readOnly = true)
    public List<RepairHistory> getRepairHistoriesByUser(Long userId) {
        return repairHistoryRepository
                .findByVehicle_User_UserId(userId);
    }


    // 차량별
    @Transactional(readOnly = true)
    public List<RepairHistory> getRepairHistoriesByVehicle(
            Long vehicleId
    ) {
        return repairHistoryRepository
                .findByVehicle_VehicleId(vehicleId);
    }


    // 정비소별
    @Transactional(readOnly = true)
    public List<RepairHistory> getRepairHistoriesByShop(
            Long shopId
    ) {
        return repairHistoryRepository
                .findByShop_ShopId(shopId);
    }


    // 예약별
    @Transactional(readOnly = true)
    public RepairHistory getRepairHistoryByReservation(
            Long reservationId
    ) {

        return repairHistoryRepository
                .findByReservation_ReservationId(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "해당 예약의 정비 이력을 찾을 수 없습니다."
                        ));
    }
}