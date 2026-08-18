package com.example.denti_back.member.entity;

import com.example.denti_back.member.enums.Provider;
import com.example.denti_back.member.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String email;
    private String password;
    private String name;
    private String nickName;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    private String providerId;
}