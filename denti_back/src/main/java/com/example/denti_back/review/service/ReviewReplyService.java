package com.example.denti_back.review.service;

import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.review.dto.request.ReviewReplyRequest;
import com.example.denti_back.review.dto.response.ReviewReplyResponse;
import com.example.denti_back.review.entity.Review;
import com.example.denti_back.review.entity.ReviewReply;
import com.example.denti_back.review.repository.ReviewReplyRepository;
import com.example.denti_back.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewReplyService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;

    // 해당 리뷰가 작성된 정비소의 소유자가 공식 답변을 등록한다.
    @Transactional
    public ReviewReplyResponse createReply(
            Long reviewId,
            Long currentUserId,
            ReviewReplyRequest request) {

        validateContent(request.getContent());

        Review review = findReview(reviewId);

        // 로그인 사용자가 해당 정비소의 소유자인지 확인한다.
        validateShopOwner(review, currentUserId);

        // 리뷰 하나에는 정비소 공식 답변을 하나만 작성할 수 있다.
        if (reviewReplyRepository.existsByReview_ReviewId(reviewId)) {
            throw new IllegalStateException(
                    "해당 리뷰에는 이미 정비소 답변이 작성되어 있습니다.");
        }

        ReviewReply reply = new ReviewReply();
        reply.setReview(review);
        reply.setContent(request.getContent().trim());

        ReviewReply savedReply =
                reviewReplyRepository.save(reply);

        return toReplyResponse(savedReply);
    }

    // 해당 정비소의 소유자가 기존 공식 답변을 수정한다.
    @Transactional
    public ReviewReplyResponse updateReply(
            Long reviewId,
            Long currentUserId,
            ReviewReplyRequest request) {

        validateContent(request.getContent());

        ReviewReply reply = findReplyByReviewId(reviewId);

        // 답변이 달린 리뷰를 통해 정비소 소유자를 확인한다.
        validateShopOwner(reply.getReview(), currentUserId);

        reply.setContent(request.getContent().trim());

        ReviewReply updatedReply =
                reviewReplyRepository.save(reply);

        return toReplyResponse(updatedReply);
    }

    // 해당 정비소의 소유자가 공식 답변을 삭제한다.
    @Transactional
    public void deleteReply(
            Long reviewId,
            Long currentUserId) {

        ReviewReply reply = findReplyByReviewId(reviewId);

        validateShopOwner(reply.getReview(), currentUserId);

        reviewReplyRepository.delete(reply);
    }

    // 리뷰 번호를 기준으로 리뷰를 조회한다.
    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "리뷰를 찾을 수 없습니다."));
    }

    // 리뷰 번호를 기준으로 정비소 답변을 조회한다.
    private ReviewReply findReplyByReviewId(Long reviewId) {
        return reviewReplyRepository
                .findByReview_ReviewId(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비소 답변을 찾을 수 없습니다."));
    }

    // 로그인 사용자가 리뷰 대상 정비소의 소유자인지 확인한다.
    private void validateShopOwner(
            Review review,
            Long currentUserId) {

        Long ownerId = review
                .getReservation()
                .getShop()
                .getOwner()
                .getUserId();

        if (!Objects.equals(ownerId, currentUserId)) {
            throw new IllegalStateException(
                    "해당 정비소만 리뷰에 답변할 수 있습니다.");
        }
    }

    // 정비소 답변 내용이 비어 있는지 확인한다.
    private void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "정비소 답변 내용을 입력해야 합니다.");
        }
    }

    // ReviewReply 엔티티를 응답 DTO로 변환한다.
    private ReviewReplyResponse toReplyResponse(
            ReviewReply reply) {

        ReviewReplyResponse response =
                new ReviewReplyResponse();

        response.setReplyId(reply.getReplyId());
        response.setContent(reply.getContent());
        response.setCreatedAt(reply.getCreatedAt());
        response.setUpdatedAt(reply.getUpdatedAt());

        return response;
    }
}