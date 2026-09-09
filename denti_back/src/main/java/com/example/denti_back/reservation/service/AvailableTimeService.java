package com.example.denti_back.reservation.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.reservation.dto.AvailableTimeBulkRequestDto;
import com.example.denti_back.reservation.dto.AvailableTimeRequestDto;
import com.example.denti_back.reservation.dto.AvailableTimeResponseDto;
import com.example.denti_back.reservation.entity.AvailableTime;
import com.example.denti_back.reservation.repository.AvailableTimeRepository;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvailableTimeService {

    private final AvailableTimeRepository availableTimeRepository;
    private final RepairShopRepository repairShopRepository;

    public List<AvailableTime> getAllAvailableTimes() {
        return availableTimeRepository.findAll();
    }

    public List<AvailableTimeResponseDto> getAvailableTimesByShopAndDate(Long shopId, LocalDate availableDate) {
        return availableTimeRepository.findByShop_ShopIdAndAvailableDate(shopId, availableDate)
                .stream()
                .map(AvailableTimeResponseDto::new)
                .toList();
    }

    // 정비소 소유자 확인 (관리 API 공통)
    private RepairShop verifyOwnership(Long shopId, User user) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        if (!shop.getOwner().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("본인 소유의 정비소만 관리할 수 있습니다.");
        }
        return shop;
    }

    // 개별 등록
    @Transactional
    public AvailableTimeResponseDto createAvailableTime(User user, AvailableTimeRequestDto request) {
        RepairShop shop = verifyOwnership(request.getShopId(), user);

        boolean exists = availableTimeRepository
                .findByShop_ShopIdAndAvailableDate(shop.getShopId(), request.getAvailableDate())
                .stream()
                .anyMatch(a -> a.getAvailableTime().equals(request.getAvailableTime()));

        if (exists) {
            throw new IllegalStateException("이미 등록된 시간대입니다.");
        }

        AvailableTime availableTime = new AvailableTime();
        availableTime.setShop(shop);
        availableTime.setAvailableDate(request.getAvailableDate());
        availableTime.setAvailableTime(request.getAvailableTime());
        availableTime.setCapacity(request.getCapacity());
        availableTime.setReservedCount(0);

        return new AvailableTimeResponseDto(availableTimeRepository.save(availableTime));
    }

    // 자동 생성 (기간 + 요일 + 시간대 목록)
    @Transactional
    public List<AvailableTimeResponseDto> createAvailableTimesBulk(User user, AvailableTimeBulkRequestDto request) {
        RepairShop shop = verifyOwnership(request.getShopId(), user);

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("시작일이 종료일보다 늦을 수 없습니다.");
        }

        List<AvailableTime> created = new ArrayList<>();

        for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
            if (!request.getDaysOfWeek().contains(date.getDayOfWeek())) {
                continue;
            }

            List<AvailableTime> existing = availableTimeRepository
                    .findByShop_ShopIdAndAvailableDate(shop.getShopId(), date);

            for (var time : request.getTimes()) {
                boolean alreadyExists = existing.stream()
                        .anyMatch(a -> a.getAvailableTime().equals(time));

                if (alreadyExists) {
                    continue; // 이미 있으면 건너뜀 (중복 방지)
                }

                AvailableTime availableTime = new AvailableTime();
                availableTime.setShop(shop);
                availableTime.setAvailableDate(date);
                availableTime.setAvailableTime(time);
                availableTime.setCapacity(request.getCapacity());
                availableTime.setReservedCount(0);

                created.add(availableTimeRepository.save(availableTime));
            }
        }

        return created.stream().map(AvailableTimeResponseDto::new).toList();
    }

    // 정원 수정 (예약이 있는 시간대도 정원만 조정 가능, 단 이미 예약된 인원보다 적게는 불가)
    @Transactional
    public AvailableTimeResponseDto updateCapacity(Long availableTimeId, User user, int capacity) {
        AvailableTime availableTime = availableTimeRepository.findById(availableTimeId)
                .orElseThrow(() -> new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        verifyOwnership(availableTime.getShop().getShopId(), user);

        if (capacity < availableTime.getReservedCount()) {
            throw new IllegalArgumentException("정원은 현재 예약 인원(" + availableTime.getReservedCount() + "명)보다 적게 설정할 수 없습니다.");
        }

        availableTime.setCapacity(capacity);
        return new AvailableTimeResponseDto(availableTime);
    }

    // 삭제 (예약된 인원이 있으면 삭제 불가)
    @Transactional
    public void deleteAvailableTime(Long availableTimeId, User user) {
        AvailableTime availableTime = availableTimeRepository.findById(availableTimeId)
                .orElseThrow(() -> new IllegalArgumentException("예약 가능 시간을 찾을 수 없습니다."));

        verifyOwnership(availableTime.getShop().getShopId(), user);

        if (availableTime.getReservedCount() > 0) {
            throw new IllegalStateException("이미 예약이 있는 시간대는 삭제할 수 없습니다.");
        }

        availableTimeRepository.delete(availableTime);
    }
}