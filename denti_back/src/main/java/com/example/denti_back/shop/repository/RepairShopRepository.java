package com.example.denti_back.shop.repository;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.enums.ApprovalStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepairShopRepository extends JpaRepository<RepairShop, Long> {
    Optional<RepairShop> findByOwner(User owner);
    List<RepairShop> findByApprovalStatus(ApprovalStatus approvalStatus);

}