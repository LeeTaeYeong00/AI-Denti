package com.example.denti_back.review.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.review.entity.ReviewLike;

public interface ReviewLikeRepository
        extends JpaRepository<ReviewLike, Long> {

    // 해당 사용자가 특정 리뷰에 좋아요를 눌렀는지 확인한다.
    boolean existsByReview_ReviewIdAndUser_UserId(
            Long reviewId,
            Long userId
    );

    // 특정 리뷰가 받은 전체 좋아요 개수를 조회한다.
    long countByReview_ReviewId(Long reviewId);

    // 좋아요가 아직 존재하지 않을 때만 등록한다.
    // 동일한 좋아요가 이미 있으면 오류 없이 현재 상태를 유지한다.
    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query(
            value = """
                    INSERT IGNORE INTO review_like
                        (review_id, user_id, created_at)
                    VALUES
                        (:reviewId, :userId, CURRENT_TIMESTAMP)
                    """,
            nativeQuery = true
    )
    int insertLikeIfAbsent(
            @Param("reviewId") Long reviewId,
            @Param("userId") Long userId
    );

    // 특정 사용자가 특정 리뷰에 누른 좋아요를 삭제한다.
    // 이미 삭제된 상태에서 다시 요청해도 오류가 발생하지 않는다.
    long deleteByReview_ReviewIdAndUser_UserId(
            Long reviewId,
            Long userId
    );

    // 리뷰가 삭제될 때 해당 리뷰의 좋아요를 모두 삭제한다.
    void deleteByReview_ReviewId(Long reviewId);
}