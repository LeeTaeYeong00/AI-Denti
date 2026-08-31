package com.example.denti_back.review.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.member.security.CustomUserDetails;
import com.example.denti_back.review.dto.request.ReviewReplyRequest;
import com.example.denti_back.review.dto.response.ReviewReplyResponse;
import com.example.denti_back.review.service.ReviewReplyService;

import lombok.RequiredArgsConstructor;

// 정비소의 리뷰 공식 답변과 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/reviews/{reviewId}/reply")
@RequiredArgsConstructor
public class ReviewReplyController {

    private final ReviewReplyService reviewReplyService;

    // 해당 리뷰가 작성된 정비소의 소유자가 공식 답변을 등록한다.
    @PostMapping
    public ResponseEntity<ReviewReplyResponse> createReply(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody
            ReviewReplyRequest request
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ReviewReplyResponse response =
                reviewReplyService.createReply(
                        reviewId,
                        currentUserId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 정비소 소유자가 기존 공식 답변을 수정한다.
    @PutMapping
    public ResponseEntity<ReviewReplyResponse> updateReply(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody
            ReviewReplyRequest request
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ReviewReplyResponse response =
                reviewReplyService.updateReply(
                        reviewId,
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 정비소 소유자가 해당 리뷰에 작성한 공식 답변을 삭제한다.
    @DeleteMapping
    public ResponseEntity<Void> deleteReply(
            @PathVariable
            Long reviewId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        reviewReplyService.deleteReply(
                reviewId,
                currentUserId
        );

        return ResponseEntity.noContent().build();
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