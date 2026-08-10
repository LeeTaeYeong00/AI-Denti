package com.example.denti_back.reservation.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Reservation createReservation(Reservation reservation) {

        AvailableTime availableTime = availableTimeRepository
                .findById(reservation.getAvailableTime().getAvailableTimeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        if (availableTime.isReserved()) {
            throw new IllegalStateException("이미 예약된 시간입니다.");
        }

        if (!availableTime.getShop().getShopId()
                .equals(reservation.getShop().getShopId())) {
            throw new IllegalArgumentException("정비소 정보가 일치하지 않습니다.");
        }

        reservation.setStatus(ReservationStatus.PENDING);

        availableTime.setReserved(true);
        availableTimeRepository.save(availableTime);

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservations() {
        return reservationRepository.findAll();
    }

    @Transactional
    public void cancelReservation(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        AvailableTime availableTime = reservation.getAvailableTime();
        availableTime.setReserved(false);

        availableTimeRepository.save(availableTime);
        reservationRepository.save(reservation);
    }
    
}