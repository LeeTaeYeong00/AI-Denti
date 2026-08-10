package com.example.denti_back.reservation.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.repository.AvailableTimeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvailableTimeService {

    private final AvailableTimeRepository availableTimeRepository;

    public List<AvailableTime> getAllAvailableTimes() {
        return availableTimeRepository.findAll();
    }

    @Transactional
    public AvailableTime createAvailableTime(AvailableTime availableTime) {
        return availableTimeRepository.save(availableTime);
    }   

    public List<AvailableTime> getAvailableTimesByShopAndDate(
            Long shopId,
            LocalDate availableDate
    ) {
        return availableTimeRepository
                .findByShop_ShopIdAndAvailableDate(shopId, availableDate);
    }

    public AvailableTime updateAvailableTime(
            Long availableTimeId,
            AvailableTime request
    ) {
        AvailableTime availableTime = availableTimeRepository
                .findById(availableTimeId)
                .orElseThrow(() -> new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        availableTime.setAvailableDate(request.getAvailableDate());
        availableTime.setAvailableTime(request.getAvailableTime());

        return availableTimeRepository.save(availableTime);
    }

    public void deleteAvailableTime(Long availableTimeId) {
        AvailableTime availableTime = availableTimeRepository
                .findById(availableTimeId)
                .orElseThrow(() -> new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        availableTimeRepository.delete(availableTime);
    }
}