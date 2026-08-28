package com.example.denti_back.reservation.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.reservation.dto.ReservationRequestDto;
import com.example.denti_back.reservation.dto.ReservationResponseDto;
import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.entity.ReservationHistory;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.reservation.repository.AvailableTimeRepository;
import com.example.denti_back.reservation.repository.ReservationHistoryRepository;
import com.example.denti_back.reservation.repository.ReservationRepository;
import com.example.denti_back.shop.entity.RepairHistory;
import com.example.denti_back.shop.entity.RepairShopHour;
import com.example.denti_back.shop.repository.RepairHistoryRepository;
import com.example.denti_back.shop.repository.RepairItemRepository;
import com.example.denti_back.shop.repository.RepairShopHourRepository;
import com.example.denti_back.vehicle.entity.Vehicle;
import com.example.denti_back.vehicle.repository.VehicleRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final RepairShopHourRepository repairShopHourRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationHistoryRepository reservationHistoryRepository;
    private final RepairHistoryRepository repairHistoryRepository;
    

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Reservation createReservation(ReservationRequestDto request) {

        AvailableTime availableTime = availableTimeRepository
                .findByIdForUpdate(request.getAvailableTimeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        boolean alreadyReserved = reservationRepository
                .existsByUser_UserIdAndAvailableTime_AvailableTimeIdAndStatusNot(
                        request.getUserId(),
                        request.getAvailableTimeId(),
                        ReservationStatus.CANCELLED
                );

        if (alreadyReserved) {
            throw new IllegalStateException(
                    "이미 해당 시간에 예약한 내역이 있습니다."
            );
        }

        if (availableTime.isReserved()) {
            throw new IllegalStateException("이미 예약된 시간입니다.");
        }

        if (!availableTime.getShop().getShopId()
                .equals(request.getShopId())) {
            throw new IllegalArgumentException("정비소 정보가 일치하지 않습니다.");
        }

        RepairShopHour shopHour = repairShopHourRepository
                .findByShop_ShopIdAndDayOfWeek(
                        availableTime.getShop().getShopId(),
                        availableTime.getAvailableDate().getDayOfWeek()
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "해당 날짜에는 정비소가 운영되지 않습니다."
                        ));

        if (availableTime.getAvailableTime().isBefore(shopHour.getOpenTime())
                || !availableTime.getAvailableTime().isBefore(shopHour.getCloseTime())) {

            throw new IllegalStateException(
                    "정비소 영업시간 외에는 예약할 수 없습니다."
            );
        }

        Vehicle vehicle = vehicleRepository
                .findById(request.getVehicleId())
                .orElseThrow(() ->
                        new IllegalArgumentException("차량을 찾을 수 없습니다."));

        if (!vehicle.getUser().getUserId().equals(request.getUserId())) {
        throw new IllegalArgumentException(
                "본인의 차량만 예약할 수 있습니다."
        );
        }

        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);

        User user = entityManager.getReference(
                User.class,
                request.getUserId()
        );

        reservation.setUser(user);
        reservation.setShop(availableTime.getShop());
        reservation.setAvailableTime(availableTime);
        reservation.setStatus(ReservationStatus.PENDING);

        availableTime.setReserved(true);
        availableTimeRepository.save(availableTime);

        Reservation savedReservation =
                reservationRepository.save(reservation);

        ReservationHistory history = new ReservationHistory();
        history.setReservation(savedReservation);
        history.setStatus(ReservationStatus.PENDING);
        history.setChangedAt(LocalDateTime.now());

        reservationHistoryRepository.save(history);

        return savedReservation;
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservations() {

        return reservationRepository.findAll()
                .stream()
                .map(ReservationResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservationsByUser(Long userId) {

        return reservationRepository.findByUser_UserId(userId)
                .stream()
                .map(ReservationResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservationsByShop(Long shopId) {

        return reservationRepository.findByShop_ShopId(shopId)
                .stream()
                .map(ReservationResponseDto::new)
                .toList();
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        ReservationStatus currentStatus = reservation.getStatus();

        // 이미 취소된 예약
        if (currentStatus == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        // 완료된 예약은 취소 불가
        if (currentStatus == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("완료된 예약은 취소할 수 없습니다.");
        }

        // 거절된 예약은 취소 불가
        if (currentStatus == ReservationStatus.REJECTED) {
            throw new IllegalStateException("거절된 예약은 취소할 수 없습니다.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        AvailableTime availableTime = reservation.getAvailableTime();
        availableTime.setReserved(false);

        availableTimeRepository.save(availableTime);

        Reservation savedReservation =
                reservationRepository.save(reservation);

        ReservationHistory history = new ReservationHistory();
        history.setReservation(savedReservation);
        history.setStatus(ReservationStatus.CANCELLED);
        history.setChangedAt(LocalDateTime.now());

        reservationHistoryRepository.save(history);

        return savedReservation;
    }

    @Transactional
    public Reservation updateReservationStatus(
            Long reservationId,
            ReservationStatus status
    ) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        ReservationStatus currentStatus = reservation.getStatus();

        // 취소된 예약은 변경 불가
        if (currentStatus == ReservationStatus.CANCELLED) {
            throw new IllegalStateException(
                    "취소된 예약은 상태를 변경할 수 없습니다."
            );
        }

        // 완료된 예약은 변경 불가
        if (currentStatus == ReservationStatus.COMPLETED) {
            throw new IllegalStateException(
                    "완료된 예약은 상태를 변경할 수 없습니다."
            );
        }

        // 정상적인 상태 변경인지 확인
        boolean validTransition =
                (currentStatus == ReservationStatus.PENDING &&
                        (status == ReservationStatus.CONFIRMED ||
                         status == ReservationStatus.REJECTED))

                || (currentStatus == ReservationStatus.CONFIRMED &&
                        status == ReservationStatus.IN_PROGRESS)

                || (currentStatus == ReservationStatus.IN_PROGRESS &&
                        status == ReservationStatus.COMPLETED);

        if (!validTransition) {
            throw new IllegalStateException(
                    currentStatus + " 상태에서는 "
                    + status + " 상태로 변경할 수 없습니다."
            );
        }

        reservation.setStatus(status);

        // 예약 거절 시 해당 시간 다시 예약 가능하도록 변경
        if (status == ReservationStatus.REJECTED) {
        AvailableTime availableTime = reservation.getAvailableTime();
        availableTime.setReserved(false);
        availableTimeRepository.save(availableTime);
        }

        Reservation savedReservation =
                reservationRepository.save(reservation);

        ReservationHistory history = new ReservationHistory();
        history.setReservation(savedReservation);
        history.setStatus(status);
        history.setChangedAt(LocalDateTime.now());

        reservationHistoryRepository.save(history);

        // 예약이 실제 정비 완료 상태가 되면 정비 이력 생성
        if (status == ReservationStatus.COMPLETED) {

        RepairHistory repairHistory = new RepairHistory();

        repairHistory.setVehicle(reservation.getVehicle());
        repairHistory.setReservation(reservation);
        repairHistory.setShop(reservation.getShop());

        repairHistory.setDescription("정비 완료");
        repairHistory.setRepairPrice(0);
        repairHistory.setRepairedAt(LocalDateTime.now());

        repairHistoryRepository.save(repairHistory);
        }

        return savedReservation;
    }
}