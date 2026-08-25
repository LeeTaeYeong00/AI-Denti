package com.example.denti_back.vehicle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.vehicle.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByUser_UserId(Long userId);
}