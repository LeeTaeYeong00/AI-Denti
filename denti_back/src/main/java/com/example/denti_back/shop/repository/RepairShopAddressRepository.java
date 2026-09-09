package com.example.denti_back.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.shop.entity.RepairShopAddress;

public interface RepairShopAddressRepository
        extends JpaRepository<RepairShopAddress, Long> {

    Optional<RepairShopAddress> findByRepairShop_ShopId(Long shopId);

    @Query("""
        SELECT a
        FROM RepairShopAddress a
        WHERE
            (6371 * acos(
                cos(radians(:latitude))
                * cos(radians(a.latitude))
                * cos(radians(a.longitude) - radians(:longitude))
                + sin(radians(:latitude))
                * sin(radians(a.latitude))
            )) <= :distance
    """)
    List<RepairShopAddress> findNearbyAddresses(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("distance") Double distance
    );
}