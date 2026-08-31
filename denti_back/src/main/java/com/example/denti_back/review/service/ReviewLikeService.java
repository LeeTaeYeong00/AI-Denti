package com.example.denti_back.review.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.member.repository.UserRepository;
import com.example.denti_back.review.dto.response.ReviewLikeResponse;
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

    // 리뷰를 좋아요 상태로 만든다.
    // 이미 좋아요 상태라면 추가로 저장하지 않고 현재 상태를 반환한다.
    @Transactional
    public ReviewLikeResponse addLike(
            Long reviewId,
            Long currentUserId) {

        validateCurrentUser(currentUserId);
        validateReview(reviewId);

        reviewLikeRepository.insertLikeIfAbsent(
                reviewId,
                currentUserId);

        long likeCount =
                reviewLikeRepository
                        .countByReview_ReviewId(
                                reviewId);

        return createLikeResponse(
                reviewId,
                likeCount,
                true);
    }

    // 리뷰를 좋아요 취소 상태로 만든다.
    // 이미 취소된 상태라면 삭제할 데이터가 없어도 정상 처리한다.
    @Transactional
    public ReviewLikeResponse removeLike(
            Long reviewId,
            Long currentUserId) {

        validateCurrentUser(currentUserId);
        validateReview(reviewId);

        reviewLikeRepository
                .deleteByReview_ReviewIdAndUser_UserId(
                        reviewId,
                        currentUserId);

        long likeCount =
                reviewLikeRepository
                        .countByReview_ReviewId(
                                reviewId);

        return createLikeResponse(
                reviewId,
                likeCount,
                false);
    }

    // 현재 사용자의 리뷰 좋아요 상태와 전체 좋아요 개수를 조회한다.
    public ReviewLikeResponse getLikeStatus(
            Long reviewId,
            Long currentUserId) {

        validateReview(reviewId);

        boolean liked =
                currentUserId != null
                        && reviewLikeRepository
                                .existsByReview_ReviewIdAndUser_UserId(
                                        reviewId,
                                        currentUserId);

        long likeCount =
                reviewLikeRepository
                        .countByReview_ReviewId(
                                reviewId);

        return createLikeResponse(
                reviewId,
                likeCount,
                liked);
    }

    // 로그인 사용자 정보와 실제 사용자 존재 여부를 확인한다.
    private void validateCurrentUser(
            Long currentUserId) {

        if (currentUserId == null) {
            throw new IllegalStateException(
                    "로그인 후 좋아요를 이용할 수 있습니다.");
        }

        if (!userRepository.existsById(
                currentUserId)) {

            throw new IllegalArgumentException(
                    "사용자를 찾을 수 없습니다.");
        }
    }

    // 리뷰가 실제로 존재하는지 확인한다.
    private void validateReview(
            Long reviewId) {

        if (!reviewRepository.existsById(
                reviewId)) {

            throw new IllegalArgumentException(
                    "리뷰를 찾을 수 없습니다.");
        }
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