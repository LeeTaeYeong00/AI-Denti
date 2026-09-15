package com.example.denti_back.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UpdateProfileRequestDto {

    @NotBlank
    private String name;

    @NotBlank
    private String nickName;
}