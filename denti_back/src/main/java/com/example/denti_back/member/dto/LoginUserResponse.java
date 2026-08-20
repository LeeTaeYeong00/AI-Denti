package com.example.denti_back.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginUserResponse {
    private Long userId;
    private String email;
    private String nickName;
    private String role;
}