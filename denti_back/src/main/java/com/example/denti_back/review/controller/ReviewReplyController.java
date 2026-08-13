package com.example.denti_back.review.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    // 현재는 로그인 기능이 완성되지 않았으므로
    // X-User-Id 헤더를 통해 정비소 소유자의 회원 번호를 전달받는다.
    @PostMapping
    public ResponseEntity<ReviewReplyResponse> createReply(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestBody ReviewReplyRequest request) {

        ReviewReplyResponse response =
                reviewReplyService.createReply(
                        reviewId,
                        currentUserId,
                        request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 정비소 소유자가 기존 공식 답변의 내용을 수정한다.
    @PutMapping
    public ResponseEntity<ReviewReplyResponse> updateReply(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestBody ReviewReplyRequest request) {

        ReviewReplyResponse response =
                reviewReplyService.updateReply(
                        reviewId,
                        currentUserId,
                        request);

        return ResponseEntity.ok(response);
    }

    // 정비소 소유자가 해당 리뷰에 작성한 공식 답변을 삭제한다.
    @DeleteMapping
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        reviewReplyService.deleteReply(
                reviewId,
                currentUserId);

        return ResponseEntity.noContent().build();
    }
}