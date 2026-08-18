package com.example.denti_back.shop.repository;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RepairShopRepository extends JpaRepository<RepairShop, Long> {
    Optional<RepairShop> findByOwner(User owner);
}