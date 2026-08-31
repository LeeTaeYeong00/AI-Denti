package com.example.denti_back.review.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.member.security.CustomUserDetails;
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

    // 현재 로그인한 사용자가 완료된 예약에 리뷰를 작성한다.
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody
            ReviewCreateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

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
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "5")
            int size
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        MyReviewResponse response =
                reviewService.getMyReviews(
                        currentUserId,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    // 리뷰 한 건을 조회한다.
    // 비로그인 사용자도 조회할 수 있으므로 사용자 정보가 없을 수 있다.
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getOptionalUserId(userDetails);

        ReviewResponse response =
                reviewService.getReview(
                        reviewId,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 특정 정비소의 리뷰와 평균 별점을 조회한다.
    // 비로그인 사용자도 조회할 수 있다.
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopReviewResponse> getShopReviews(
            @PathVariable
            Long shopId,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "5")
            int size,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getOptionalUserId(userDetails);

        ShopReviewResponse response =
                reviewService.getShopReviews(
                        shopId,
                        page,
                        size,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 현재 로그인한 사용자가 본인의 리뷰를 수정한다.
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody
            ReviewUpdateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        ReviewResponse response =
                reviewService.updateReview(
                        reviewId,
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 현재 로그인한 사용자가 본인의 리뷰를 삭제한다.
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        reviewService.deleteReview(
                reviewId,
                currentUserId
        );

        return ResponseEntity.noContent().build();
    }

    // 로그인이 반드시 필요한 기능에서 사용자 번호를 가져온다.
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

    // 공개 조회 기능에서 로그인한 경우에만 사용자 번호를 가져온다.
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