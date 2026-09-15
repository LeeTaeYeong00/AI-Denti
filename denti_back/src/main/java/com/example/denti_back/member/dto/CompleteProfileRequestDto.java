package com.example.denti_back.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CompleteProfileRequestDto {

    @NotBlank
    private String nickName;

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;
}