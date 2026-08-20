package com.example.denti_back.shop.entity;

import java.time.LocalDateTime;

import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.vehicle.entity.Vehicle;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long repairHistoryId;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private RepairShop shop;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private RepairItem repairItem;

    private String description;

    private Integer repairPrice;

    private LocalDateTime repairedAt;
}