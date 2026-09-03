package com.example.denti_back.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RejectShopRequestDto {

    @NotBlank
    private String reason;
}