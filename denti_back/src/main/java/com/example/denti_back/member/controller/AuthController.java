package com.example.denti_back.member.controller;

import com.example.denti_back.member.dto.LoginRequest;
import com.example.denti_back.member.dto.LoginUserResponse;
import com.example.denti_back.member.dto.SignupRequest;
import com.example.denti_back.member.security.CustomUserDetails;
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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

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

    // 비로그인 상태를 "에러"가 아니라 "정상적으로 로그인 안 된 상태"로 취급한다.
    // 그래야 프론트에서 매 페이지 로드마다 콘솔에 4xx 에러 로그가 남지 않는다.
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
}