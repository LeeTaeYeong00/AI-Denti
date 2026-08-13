package com.example.denti_back.review.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.review.dto.response.ReviewLikeResponse;
import com.example.denti_back.review.service.ReviewLikeService;

import lombok.RequiredArgsConstructor;

// 리뷰 좋아요와 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/reviews/{reviewId}/like")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    // 좋아요 버튼을 누를 때 호출한다.
    // 좋아요가 없으면 등록하고, 이미 있으면 취소한다.
    @PostMapping
    public ResponseEntity<ReviewLikeResponse> toggleLike(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        ReviewLikeResponse response =
                reviewLikeService.toggleLike(
                        reviewId,
                        currentUserId);

        return ResponseEntity.ok(response);
    }

    // 해당 리뷰의 전체 좋아요 수와
    // 현재 사용자의 좋아요 여부를 조회한다.
    @GetMapping
    public ResponseEntity<ReviewLikeResponse> getLikeStatus(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        ReviewLikeResponse response =
                reviewLikeService.getLikeStatus(
                        reviewId,
                        currentUserId);

        return ResponseEntity.ok(response);
    }
}