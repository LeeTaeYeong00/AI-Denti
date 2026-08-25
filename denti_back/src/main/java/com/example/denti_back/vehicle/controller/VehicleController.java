package com.example.denti_back.vehicle.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.denti_back.vehicle.dto.VehicleRequestDto;
import com.example.denti_back.vehicle.dto.VehicleResponseDto;
import com.example.denti_back.vehicle.entity.Vehicle;
import com.example.denti_back.vehicle.service.VehicleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // 차량 등록
    @PostMapping
    public ResponseEntity<VehicleResponseDto> createVehicle(
            @RequestBody VehicleRequestDto request
    ) {

        Vehicle vehicle = vehicleService.createVehicle(request);

        return ResponseEntity.ok(
                new VehicleResponseDto(vehicle)
        );
    }

    // 사용자 차량 전체 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VehicleResponseDto>> getVehiclesByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                vehicleService.getVehiclesByUser(userId)
                        .stream()
                        .map(VehicleResponseDto::new)
                        .toList()
        );
    }

    // 차량 단건 조회
    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> getVehicle(
            @PathVariable Long vehicleId
    ) {

        return ResponseEntity.ok(
                new VehicleResponseDto(
                        vehicleService.getVehicle(vehicleId)
                )
        );
    }

    // 차량 수정
    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> updateVehicle(
            @PathVariable Long vehicleId,
            @RequestBody VehicleRequestDto request
    ) {

        Vehicle vehicle = vehicleService.updateVehicle(
                vehicleId,
                request
        );

        return ResponseEntity.ok(
                new VehicleResponseDto(vehicle)
        );
    }

    // 차량 삭제
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long vehicleId
    ) {

        vehicleService.deleteVehicle(vehicleId);

        return ResponseEntity.noContent().build();
    }
}