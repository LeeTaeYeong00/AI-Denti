package com.example.denti_back.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.review.entity.ReviewLike;

public interface ReviewLikeRepository
        extends JpaRepository<ReviewLike, Long> {

    // 해당 사용자가 특정 리뷰에 좋아요를 눌렀는지 확인한다.
    boolean existsByReview_ReviewIdAndUser_UserId(
        Long reviewId,
        Long userId
    );

    // 리뷰 번호와 사용자 번호를 기준으로 좋아요 정보를 조회한다.
    Optional<ReviewLike> findByReview_ReviewIdAndUser_UserId(
        Long reviewId,
        Long userId
    );

    // 특정 리뷰가 받은 전체 좋아요 개수를 조회한다.
    long countByReview_ReviewId(Long reviewId);

    // 특정 사용자가 특정 리뷰에 누른 좋아요를 삭제한다.
    void deleteByReview_ReviewIdAndUser_UserId(
        Long reviewId,
        Long userId
    );

    // 리뷰가 삭제될 때 해당 리뷰의 좋아요를 모두 삭제한다.
    void deleteByReview_ReviewId(Long reviewId);
}