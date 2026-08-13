package com.example.denti_back.reservation.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.reservation.dto.ReservationRequestDto;
import com.example.denti_back.reservation.dto.ReservationResponseDto;
import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.reservation.repository.AvailableTimeRepository;
import com.example.denti_back.reservation.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailableTimeRepository availableTimeRepository;

    @Transactional
    public Reservation createReservation(ReservationRequestDto request) {

        AvailableTime availableTime = availableTimeRepository
                .findByIdForUpdate(request.getAvailableTimeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        boolean alreadyReserved = reservationRepository
                .existsByUser_UserIdAndAvailableTime_AvailableTimeId(
                        request.getUserId(),
                        request.getAvailableTimeId()
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

        Reservation reservation = new Reservation();

        reservation.setShop(availableTime.getShop());
        reservation.setAvailableTime(availableTime);
        reservation.setStatus(ReservationStatus.PENDING);

        availableTime.setReserved(true);
        availableTimeRepository.save(availableTime);

        return reservationRepository.save(reservation);
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
        return reservationRepository.save(reservation);
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
        

        return reservationRepository.save(reservation);
    }
}