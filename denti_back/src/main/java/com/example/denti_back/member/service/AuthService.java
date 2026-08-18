package com.example.denti_back.member.service;

import com.example.denti_back.member.dto.SignupRequest;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.enums.Provider;
import com.example.denti_back.member.enums.Role;
import com.example.denti_back.member.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setNickName(request.getNickName());
        user.setRole(Role.GENERAL);
        user.setProvider(Provider.LOCAL);

        userRepository.save(user);
    }
}