package com.example.denti_back.review.controller;

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

import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.review.dto.response.ReviewLikeResponse;
import com.example.denti_back.review.ratelimit.ReviewLikeRateLimiter;
import com.example.denti_back.review.service.ReviewLikeService;

import lombok.RequiredArgsConstructor;

// 리뷰 좋아요와 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/reviews/{reviewId}/like")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;
    private final ReviewLikeRateLimiter reviewLikeRateLimiter;

    // 리뷰를 좋아요 상태로 만든다.
    // 이미 좋아요 상태여도 그대로 유지한다.
    @PutMapping
    public ResponseEntity<?> addLike(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ReviewLikeRateLimiter.RateLimitResult
                rateLimitResult =
                reviewLikeRateLimiter.tryConsume(
                        currentUserId);

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult);
        }

        ReviewLikeResponse response =
                reviewLikeService.addLike(
                        reviewId,
                        currentUserId);

        return createSuccessResponse(
                response,
                rateLimitResult);
    }

    // 리뷰를 좋아요 취소 상태로 만든다.
    // 이미 취소 상태여도 그대로 유지한다.
    @DeleteMapping
    public ResponseEntity<?> removeLike(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ReviewLikeRateLimiter.RateLimitResult
                rateLimitResult =
                reviewLikeRateLimiter.tryConsume(
                        currentUserId);

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult);
        }

        ReviewLikeResponse response =
                reviewLikeService.removeLike(
                        reviewId,
                        currentUserId);

        return createSuccessResponse(
                response,
                rateLimitResult);
    }

    // 리뷰의 좋아요 수와 현재 로그인 사용자의 좋아요 여부를 조회한다.
    @GetMapping
    public ResponseEntity<ReviewLikeResponse>
    getLikeStatus(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ReviewLikeResponse response =
                reviewLikeService.getLikeStatus(
                        reviewId,
                        currentUserId);

        return ResponseEntity.ok(response);
    }

    // 정상 처리 결과와 남은 요청 횟수를 반환한다.
    private ResponseEntity<ReviewLikeResponse>
    createSuccessResponse(
            ReviewLikeResponse response,
            ReviewLikeRateLimiter.RateLimitResult
                    rateLimitResult
    ) {

        return ResponseEntity
                .ok()
                .header(
                        "X-RateLimit-Remaining",
                        String.valueOf(
                                rateLimitResult
                                        .remainingTokens()))
                .body(response);
    }

    // 요청 제한 초과 시 429와 재시도 시간을 반환한다.
    private ResponseEntity<Map<String, Object>>
    createRateLimitResponse(
            ReviewLikeRateLimiter.RateLimitResult
                    rateLimitResult
    ) {

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header(
                        HttpHeaders.RETRY_AFTER,
                        String.valueOf(
                                rateLimitResult
                                        .retryAfterSeconds()))
                .body(Map.of(
                        "message",
                        "좋아요 요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.",
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