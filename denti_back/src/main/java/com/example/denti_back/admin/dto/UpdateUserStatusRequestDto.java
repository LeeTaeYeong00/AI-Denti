package com.example.denti_back.admin.dto;

import com.example.denti_back.member.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UpdateUserStatusRequestDto {

    @NotNull
    private UserStatus status;
}