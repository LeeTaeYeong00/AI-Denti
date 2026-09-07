package com.example.denti_back.admin.controller;

import com.example.denti_back.admin.dto.AdminUserResponseDto;
import com.example.denti_back.admin.dto.UpdateUserStatusRequestDto;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.enums.UserStatus;
import com.example.denti_back.member.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    // 전체 유저 목록 조회
    @GetMapping
    public List<AdminUserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserResponseDto::new)
                .toList();
    }

    // 회원 상태 변경 (활성 <-> 정지)
    @PutMapping("/{userId}/status")
    @Transactional
    public AdminUserResponseDto updateStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequestDto request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getRole().name().equals("ADMIN")) {
            throw new IllegalStateException("관리자 계정은 상태를 변경할 수 없습니다.");
        }

        user.setStatus(request.getStatus());
        return new AdminUserResponseDto(user);
    }

    // 강제 탈퇴 (soft delete - 상태만 WITHDRAWN으로 변경)
    @DeleteMapping("/{userId}")
    @Transactional
    public AdminUserResponseDto withdrawUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getRole().name().equals("ADMIN")) {
            throw new IllegalStateException("관리자 계정은 탈퇴 처리할 수 없습니다.");
        }

        user.setStatus(UserStatus.WITHDRAWN);
        return new AdminUserResponseDto(user);
    }
}