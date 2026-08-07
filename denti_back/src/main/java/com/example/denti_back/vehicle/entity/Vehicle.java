package com.example.denti_back.vehicle.entity;

import com.example.denti_back.member.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String manufacturer;
    private String model;
}