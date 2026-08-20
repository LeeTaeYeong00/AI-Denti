package com.example.denti_back.review.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.review.dto.request.ReviewCreateRequest;
import com.example.denti_back.review.dto.request.ReviewUpdateRequest;
import com.example.denti_back.review.dto.response.MyReviewResponse;
import com.example.denti_back.review.dto.response.ReviewResponse;
import com.example.denti_back.review.dto.response.ShopReviewResponse;
import com.example.denti_back.review.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 정비가 완료된 예약에 리뷰를 등록한다.
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader("X-User-Id")
            Long currentUserId,
            @RequestBody
            ReviewCreateRequest request) {

        ReviewResponse response =
                reviewService.createReview(
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 현재 로그인한 사용자가 작성한 리뷰 목록을 조회한다.
    @GetMapping("/my")
    public ResponseEntity<MyReviewResponse> getMyReviews(
            @RequestHeader("X-User-Id")
            Long currentUserId,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "5")
            int size) {

        MyReviewResponse response =
                reviewService.getMyReviews(
                        currentUserId,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    // 리뷰 번호를 기준으로 리뷰 한 건을 조회한다.
    // 로그인하지 않은 사용자도 리뷰를 조회할 수 있다.
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable
            Long reviewId,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            )
            Long currentUserId) {

        ReviewResponse response =
                reviewService.getReview(
                        reviewId,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 특정 정비소의 리뷰 목록과 평균 평점을 조회한다.
    // 로그인하지 않은 사용자도 정비소 리뷰를 조회할 수 있다.
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopReviewResponse> getShopReviews(
            @PathVariable
            Long shopId,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "5")
            int size,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            )
            Long currentUserId) {

        ShopReviewResponse response =
                reviewService.getShopReviews(
                        shopId,
                        page,
                        size,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 작성자가 자신의 리뷰를 수정한다.
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable
            Long reviewId,
            @RequestHeader("X-User-Id")
            Long currentUserId,
            @RequestBody
            ReviewUpdateRequest request) {

        ReviewResponse response =
                reviewService.updateReview(
                        reviewId,
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 작성자가 자신의 리뷰를 삭제한다.
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable
            Long reviewId,
            @RequestHeader("X-User-Id")
            Long currentUserId) {

        reviewService.deleteReview(
                reviewId,
                currentUserId
        );

        return ResponseEntity.noContent().build();
    }
}