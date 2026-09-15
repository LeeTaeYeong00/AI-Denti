package com.example.denti_back.member.controller;

import com.example.denti_back.member.dto.ChangePasswordRequestDto;
import com.example.denti_back.member.dto.LoginRequest;
import com.example.denti_back.member.dto.LoginUserResponse;
import com.example.denti_back.member.dto.SignupRequest;
import com.example.denti_back.member.dto.UpdateProfileRequestDto;
import com.example.denti_back.member.repository.UserRepository;
import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody @Valid SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            return ResponseEntity.ok("로그인 성공");

        } catch (LockedException e) {
            return ResponseEntity.status(403).body("정지된 계정입니다. 관리자에게 문의하세요.");
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body("탈퇴한 계정입니다.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    @GetMapping("/me")
    public ResponseEntity<LoginUserResponse> getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean isAnonymous = authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails);

        if (isAnonymous) {
            return ResponseEntity.ok(null);
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        var user = userDetails.getUser();

        return ResponseEntity.ok(new LoginUserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getNickName(),
                user.getRole().name()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody @Valid UpdateProfileRequestDto request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        user.setName(request.getName());
        user.setNickName(request.getNickName());
        userRepository.save(user);

        return ResponseEntity.ok("프로필이 수정되었습니다.");
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@RequestBody @Valid ChangePasswordRequestDto request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        if (user.getProvider() != null && !user.getProvider().name().equals("LOCAL")) {
            return ResponseEntity.badRequest().body("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("비밀번호가 변경되었습니다.");
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return null;
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}