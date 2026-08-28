package com.example.denti_back.vehicle.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;
import com.example.denti_back.vehicle.dto.VehicleRequestDto;
import com.example.denti_back.vehicle.entity.Vehicle;
import com.example.denti_back.vehicle.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    // 차량 등록
    @Transactional
    public Vehicle createVehicle(VehicleRequestDto requestDto) {

        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        Vehicle vehicle = new Vehicle();

        vehicle.setUser(user);
        vehicle.setManufacturer(requestDto.getManufacturer());
        vehicle.setModel(requestDto.getModel());

        return vehicleRepository.save(vehicle);
    }

    // 차량 1개 조회
    @Transactional(readOnly = true)
    public Vehicle getVehicle(Long vehicleId) {

        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("차량을 찾을 수 없습니다.")
                );
    }

    // 사용자별 차량 조회
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByUser(Long userId) {

        return vehicleRepository.findByUser_UserId(userId);
    }

    // 차량 수정
    @Transactional
    public Vehicle updateVehicle(
            Long vehicleId,
            VehicleRequestDto requestDto
    ) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("차량을 찾을 수 없습니다.")
                );

        vehicle.setManufacturer(requestDto.getManufacturer());
        vehicle.setModel(requestDto.getModel());

        return vehicle;
    }

    // 차량 삭제
    @Transactional
    public void deleteVehicle(Long vehicleId) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("차량을 찾을 수 없습니다.")
                );

        vehicleRepository.delete(vehicle);
    }
}