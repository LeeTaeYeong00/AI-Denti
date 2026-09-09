package com.example.denti_back.shop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class RepairShopAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    private String address;

    private Double latitude;

    private Double longitude;

    @OneToOne
    @JoinColumn(name = "shop_id")
    private RepairShop repairShop;
}