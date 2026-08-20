package com.example.denti_back.reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationRequestDto {

    @NotNull(message = "사용자 ID는 필수입니다.")
    private Long userId;

    @NotNull(message = "차량 ID는 필수입니다.")
    private Long vehicleId;

    @NotNull(message = "정비소 ID는 필수입니다.")
    private Long shopId;

    @NotNull(message = "예약 시간 ID는 필수입니다.")
    private Long availableTimeId;

    @NotNull(message = "정비 항목 ID는 필수입니다.")
    private Long itemId;
}