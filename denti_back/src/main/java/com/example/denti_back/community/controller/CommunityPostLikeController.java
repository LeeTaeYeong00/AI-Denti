package com.example.denti_back.community.controller;

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

import com.example.denti_back.community.dto.response.CommunityPostLikeResponse;
import com.example.denti_back.community.ratelimit.CommunityPostLikeRateLimiter;
import com.example.denti_back.community.service.CommunityPostLikeService;
import com.example.denti_back.member.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

// 게시글 좋아요와 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/community/posts/{postId}/like")
@RequiredArgsConstructor
public class CommunityPostLikeController {

    private final CommunityPostLikeService communityPostLikeService;
    private final CommunityPostLikeRateLimiter communityPostLikeRateLimiter;

    // 게시글을 좋아요 상태로 만든다.
    @PutMapping
    public ResponseEntity<?> addLike(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityPostLikeRateLimiter.RateLimitResult
                rateLimitResult =
                communityPostLikeRateLimiter.tryConsume(
                        currentUserId
                );

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult
            );
        }

        CommunityPostLikeResponse response =
                communityPostLikeService.addLike(
                        postId,
                        currentUserId
                );

        return createSuccessResponse(
                response,
                rateLimitResult
        );
    }

    // 게시글 좋아요를 취소한다.
    @DeleteMapping
    public ResponseEntity<?> removeLike(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityPostLikeRateLimiter.RateLimitResult
                rateLimitResult =
                communityPostLikeRateLimiter.tryConsume(
                        currentUserId
                );

        if (!rateLimitResult.allowed()) {
            return createRateLimitResponse(
                    rateLimitResult
            );
        }

        CommunityPostLikeResponse response =
                communityPostLikeService.removeLike(
                        postId,
                        currentUserId
                );

        return createSuccessResponse(
                response,
                rateLimitResult
        );
    }

    // 게시글의 좋아요 수와 현재 사용자의 좋아요 여부를 조회한다.
    @GetMapping
    public ResponseEntity<CommunityPostLikeResponse>
    getLikeStatus(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getOptionalUserId(userDetails);

        CommunityPostLikeResponse response =
                communityPostLikeService.getLikeStatus(
                        postId,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 정상 처리 결과와 남은 요청 가능 횟수를 반환한다.
    private ResponseEntity<CommunityPostLikeResponse>
    createSuccessResponse(
            CommunityPostLikeResponse response,
            CommunityPostLikeRateLimiter.RateLimitResult
                    rateLimitResult
    ) {

        return ResponseEntity
                .ok()
                .header(
                        "X-RateLimit-Remaining",
                        String.valueOf(
                                rateLimitResult.remainingTokens()
                        )
                )
                .body(response);
    }

    // 요청 제한을 초과하면 429 상태와 재시도 시간을 반환한다.
    private ResponseEntity<Map<String, Object>>
    createRateLimitResponse(
            CommunityPostLikeRateLimiter.RateLimitResult
                    rateLimitResult
    ) {

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header(
                        HttpHeaders.RETRY_AFTER,
                        String.valueOf(
                                rateLimitResult.retryAfterSeconds()
                        )
                )
                .body(Map.of(
                        "message",
                        "좋아요 요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.",
                        "retryAfterSeconds",
                        rateLimitResult.retryAfterSeconds()
                ));
    }

    // 로그인이 필요한 요청에서 현재 사용자 번호를 가져온다.
    private Long getRequiredUserId(
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

    // 공개 조회 요청에서 로그인한 경우에만 사용자 번호를 가져온다.
    private Long getOptionalUserId(
            CustomUserDetails userDetails
    ) {

        if (userDetails == null) {
            return null;
        }

        return userDetails
                .getUser()
                .getUserId();
    }
}