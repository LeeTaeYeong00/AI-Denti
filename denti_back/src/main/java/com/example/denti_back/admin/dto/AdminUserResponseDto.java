package com.example.denti_back.admin.dto;

import com.example.denti_back.member.entity.User;
import lombok.Getter;

@Getter
public class AdminUserResponseDto {

    private Long userId;
    private String username;
    private String name;
    private String email;
    private String nickName;
    private String role;
    private String provider;
    private String status;

    public AdminUserResponseDto(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.nickName = user.getNickName();
        this.role = user.getRole().name();
        this.provider = user.getProvider() != null ? user.getProvider().name() : null;
        this.status = user.getStatus() != null ? user.getStatus().name() : null;
    }
}