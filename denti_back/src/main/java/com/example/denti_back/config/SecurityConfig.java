package com.example.denti_back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/api/health",
                    "/api/test/**"
                ).permitAll()

                .requestMatchers("/uploads/**").permitAll()

                // 정비소 주소 / 예약 가능 시간 / 영업시간 / 정비소 공개 정보
                .requestMatchers(
                    "/api/repair-shop-addresses/**",
                    "/api/available-times/**",
                    "/api/repair-shops/*/hours/**",
                    "/api/repair-shops/*"
                ).permitAll()

                // 내 정비소 조회
                .requestMatchers(
                    "/api/repair-shops/my"
                ).hasRole("SHOP")

                // 정비 항목
                // 조회는 누구나 가능
                .requestMatchers(
                    org.springframework.http.HttpMethod.GET,
                    "/api/repair-items/shop/**"
                ).permitAll()

                // 등록은 SHOP
                .requestMatchers(
                    org.springframework.http.HttpMethod.POST,
                    "/api/repair-items/shop/**"
                ).hasRole("SHOP")

                // 수정 / 삭제는 SHOP
                .requestMatchers(
                    org.springframework.http.HttpMethod.PUT,
                    "/api/repair-items/**"
                ).hasRole("SHOP")

                .requestMatchers(
                    org.springframework.http.HttpMethod.DELETE,
                    "/api/repair-items/**"
                ).hasRole("SHOP")

                // SHOP 예약 관리
                .requestMatchers(
                    "/api/reservations/shop/**",
                    "/api/reservations/*/status"
                ).hasRole("SHOP")

                // 일반 예약 기능
                .requestMatchers(
                    "/api/reservations/**"
                ).authenticated()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}