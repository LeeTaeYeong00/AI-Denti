package com.example.denti_back.review.controller;

import org.springframework.http.HttpStatus;
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
import com.example.denti_back.review.dto.response.ReviewResponse;
import com.example.denti_back.review.dto.response.ShopReviewResponse;
import com.example.denti_back.review.service.ReviewService;

import lombok.RequiredArgsConstructor;

// React에서 전달한 리뷰 관련 HTTP 요청을 처리하는 Controller이다.
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 완료된 예약을 대상으로 새로운 리뷰를 등록한다.
    // 현재는 로그인 기능이 완성되지 않았으므로
    // X-User-Id 헤더로 사용자 번호를 임시 전달받는다.
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestBody ReviewCreateRequest request) {

        ReviewResponse response =
                reviewService.createReview(currentUserId, request);

        // 등록 성공을 의미하는 HTTP 201 상태와 리뷰 정보를 반환한다.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 리뷰 번호를 이용하여 리뷰 한 건을 조회한다.
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable Long reviewId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        ReviewResponse response =
                reviewService.getReview(reviewId, currentUserId);

        return ResponseEntity.ok(response);
    }

    // 특정 정비소의 평균 평점과 리뷰 목록을 페이지 단위로 조회한다.
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopReviewResponse> getShopReviews(
            @PathVariable Long shopId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        ShopReviewResponse response =
                reviewService.getShopReviews(
                        shopId,
                        page,
                        size,
                        currentUserId);

        return ResponseEntity.ok(response);
    }

    // 리뷰 작성자가 기존 리뷰의 별점과 내용을 수정한다.
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestBody ReviewUpdateRequest request) {

        ReviewResponse response =
                reviewService.updateReview(
                        reviewId,
                        currentUserId,
                        request);

        return ResponseEntity.ok(response);
    }

    // 리뷰 작성자가 본인의 리뷰를 삭제한다.
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        reviewService.deleteReview(reviewId, currentUserId);

        // 삭제 성공 후 응답 본문 없이 HTTP 204 상태를 반환한다.
        return ResponseEntity.noContent().build();
    }
}