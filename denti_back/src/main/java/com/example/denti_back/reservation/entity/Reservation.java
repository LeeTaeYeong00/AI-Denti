package com.example.denti_back.reservation.entity;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.shop.entity.RepairItem;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.vehicle.entity.Vehicle;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private RepairShop shop;

    @ManyToOne
    @JoinColumn(name = "available_time_id")
    private AvailableTime availableTime;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private RepairItem repairItem;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}