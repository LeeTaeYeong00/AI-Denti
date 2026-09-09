package com.example.denti_back.shop.repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.entity.RepairShopHour;

public interface RepairShopHourRepository
        extends JpaRepository<RepairShopHour, Long> {

    List<RepairShopHour> findByShop(RepairShop shop);

    Optional<RepairShopHour> findByShop_ShopIdAndDayOfWeek(
            Long shopId,
            DayOfWeek dayOfWeek
    );

    void deleteByShop(RepairShop shop);
}