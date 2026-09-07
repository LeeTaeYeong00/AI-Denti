package com.example.denti_back.favorite.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.favorite.dto.ShopFavoriteResponse;
import com.example.denti_back.favorite.dto.ShopFavoriteStatusResponse;
import com.example.denti_back.favorite.ratelimit.ShopFavoriteRateLimiter;
import com.example.denti_back.favorite.service.ShopFavoriteService;
import com.example.denti_back.member.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

// 정비소 즐겨찾기와 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class ShopFavoriteController {

    private final ShopFavoriteService shopFavoriteService;
    private final ShopFavoriteRateLimiter shopFavoriteRateLimiter;

    // 현재 로그인한 사용자가 정비소를 즐겨찾기 상태로 만든다.
    // 이미 등록된 상태여도 그대로 유지한다.
    @PutMapping("/shops/{shopId}")
    public ResponseEntity<?> addFavorite(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ShopFavoriteRateLimiter.RateLimitResult
                rateLimitResult =
                shopFavoriteRateLimiter.tryConsume(
                        currentUserId
                );

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult
            );
        }

        ShopFavoriteResponse response =
                shopFavoriteService.addFavorite(
                        currentUserId,
                        shopId
                );

        return ResponseEntity
                .ok()
                .header(
                        "X-RateLimit-Remaining",
                        String.valueOf(
                                rateLimitResult
                                        .remainingTokens()
                        )
                )
                .body(response);
    }

    // 현재 로그인한 사용자가 정비소를 즐겨찾기 해제 상태로 만든다.
    // 이미 해제된 상태여도 정상 처리한다.
    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ShopFavoriteRateLimiter.RateLimitResult
                rateLimitResult =
                shopFavoriteRateLimiter.tryConsume(
                        currentUserId
                );

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult
            );
        }

        shopFavoriteService.removeFavorite(
                currentUserId,
                shopId
        );

        return ResponseEntity
                .noContent()
                .header(
                        "X-RateLimit-Remaining",
                        String.valueOf(
                                rateLimitResult
                                        .remainingTokens()
                        )
                )
                .build();
    }

    // 현재 사용자가 해당 정비소를 즐겨찾기했는지 조회한다.
    // 조회 요청에는 Rate Limit을 적용하지 않는다.
    @GetMapping("/shops/{shopId}/status")
    public ResponseEntity<ShopFavoriteStatusResponse>
    getFavoriteStatus(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ShopFavoriteStatusResponse response =
                shopFavoriteService.getFavoriteStatus(
                        currentUserId,
                        shopId
                );

        return ResponseEntity.ok(response);
    }

    // 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 조회한다.
    // 조회 요청에는 Rate Limit을 적용하지 않는다.
    @GetMapping("/my")
    public ResponseEntity<List<ShopFavoriteResponse>>
    getMyFavorites(
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        List<ShopFavoriteResponse> responses =
                shopFavoriteService.getMyFavorites(
                        currentUserId
                );

        return ResponseEntity.ok(responses);
    }

    // 요청 제한 초과 시 429 상태와 재시도 시간을 반환한다.
    private ResponseEntity<Map<String, Object>>
    createRateLimitResponse(
            ShopFavoriteRateLimiter.RateLimitResult
                    rateLimitResult
    ) {

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header(
                        HttpHeaders.RETRY_AFTER,
                        String.valueOf(
                                rateLimitResult
                                        .retryAfterSeconds()
                        )
                )
                .header(
                        "X-RateLimit-Remaining",
                        String.valueOf(
                                rateLimitResult
                                        .remainingTokens()
                        )
                )
                .body(Map.of(
                        "message",
                        "즐겨찾기 요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.",
                        "retryAfterSeconds",
                        rateLimitResult
                                .retryAfterSeconds()
                ));
    }

    // 로그인 세션에서 현재 사용자의 번호를 가져온다.
    private Long getCurrentUserId(
            CustomUserDetails userDetails
    ) {

        if (userDetails == null) {
            throw new IllegalStateException(
                    "로그인 후 이용할 수 있습니다."
            );
        }

        return userDetails
                .getUser()
                .getUserId();
    }
}