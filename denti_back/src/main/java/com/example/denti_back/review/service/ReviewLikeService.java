package com.example.denti_back.review.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;
import com.example.denti_back.review.dto.response.ReviewLikeResponse;
import com.example.denti_back.review.entity.Review;
import com.example.denti_back.review.entity.ReviewLike;
import com.example.denti_back.review.repository.ReviewLikeRepository;
import com.example.denti_back.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewLikeService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final UserRepository userRepository;

    // 리뷰 좋아요를 처리한다.
    // 이미 좋아요를 누른 상태라면 취소하고,
    // 좋아요를 누르지 않은 상태라면 새로 등록한다.
    @Transactional
    public ReviewLikeResponse toggleLike(
            Long reviewId,
            Long currentUserId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "리뷰를 찾을 수 없습니다."));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."));

        // 현재 사용자가 해당 리뷰에 남긴 좋아요가 있는지 조회한다.
        Optional<ReviewLike> existingLike =
                reviewLikeRepository
                        .findByReview_ReviewIdAndUser_UserId(
                                reviewId,
                                currentUserId);

        boolean liked;

        if (existingLike.isPresent()) {

            // 이미 좋아요를 누른 경우 기존 데이터를 삭제하여 취소한다.
            reviewLikeRepository.delete(existingLike.get());
            liked = false;

        } else {

            // 좋아요가 없는 경우 리뷰와 사용자를 연결하여 새로 저장한다.
            ReviewLike reviewLike = new ReviewLike();
            reviewLike.setReview(review);
            reviewLike.setUser(user);

            reviewLikeRepository.save(reviewLike);
            liked = true;
        }

        // 좋아요 등록 또는 취소 이후의 전체 좋아요 개수를 조회한다.
        long likeCount =
                reviewLikeRepository.countByReview_ReviewId(reviewId);

        return createLikeResponse(reviewId, likeCount, liked);
    }

    // 현재 사용자의 리뷰 좋아요 상태와 전체 좋아요 개수를 조회한다.
    public ReviewLikeResponse getLikeStatus(
            Long reviewId,
            Long currentUserId) {

        if (!reviewRepository.existsById(reviewId)) {
            throw new IllegalArgumentException(
                    "리뷰를 찾을 수 없습니다.");
        }

        boolean liked =
                reviewLikeRepository
                        .existsByReview_ReviewIdAndUser_UserId(
                                reviewId,
                                currentUserId);

        long likeCount =
                reviewLikeRepository.countByReview_ReviewId(reviewId);

        return createLikeResponse(reviewId, likeCount, liked);
    }

    // 좋아요 처리 결과를 프론트에 전달할 응답 DTO로 변환한다.
    private ReviewLikeResponse createLikeResponse(
            Long reviewId,
            long likeCount,
            boolean liked) {

        ReviewLikeResponse response =
                new ReviewLikeResponse();

        response.setReviewId(reviewId);
        response.setLikeCount(likeCount);
        response.setLiked(liked);

        return response;
    }
}