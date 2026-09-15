package com.example.denti_back.config;

import com.example.denti_back.member.security.CustomOAuth2UserService;
import com.example.denti_back.member.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    "/api/auth/**",
                    "/api/health"
                ).permitAll()

                .requestMatchers("/uploads/**").permitAll()

                .requestMatchers(
                    org.springframework.http.HttpMethod.GET,
                    "/api/community/posts",
                    "/api/community/posts/**"
                ).permitAll()

                .requestMatchers(
                    org.springframework.http.HttpMethod.GET,
                    "/api/reviews/my"
                ).authenticated()

                .requestMatchers(
                    org.springframework.http.HttpMethod.GET,
                    "/api/reviews/*",
                    "/api/reviews/shops/**"
                ).permitAll()

                .requestMatchers(
                    "/api/repair-shop-addresses/**",
                    "/api/available-times/**",
                    "/api/repair-shops/*/hours/**",
                    "/api/repair-shops/*"
                ).permitAll()

                .requestMatchers(
                    org.springframework.http.HttpMethod.GET,
                    "/api/repair-items",
                    "/api/repair-items/shop/**"
                ).permitAll()

                .requestMatchers(
                    "/api/reservations/**"
                ).authenticated()

                .requestMatchers(
                    org.springframework.http.HttpMethod.POST,
                    "/api/inquiries"
                ).permitAll()

                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .requestMatchers("/ws-chat/**").permitAll()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://43.200.140.195"
        ));
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