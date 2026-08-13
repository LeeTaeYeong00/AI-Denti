package com.example.denti_back.reservation.entity;

import com.example.denti_back.shop.entity.RepairShop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
public class AvailableTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long availableTimeId;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private RepairShop shop;

    private LocalDate availableDate;

    private LocalTime availableTime;

    private boolean reserved;
}