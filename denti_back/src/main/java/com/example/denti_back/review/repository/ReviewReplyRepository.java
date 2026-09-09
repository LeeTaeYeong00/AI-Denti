package com.example.denti_back.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.review.entity.ReviewReply;

public interface ReviewReplyRepository
        extends JpaRepository<ReviewReply, Long> {

    // 해당 리뷰에 정비소 답변이 이미 작성되어 있는지 확인한다.
    boolean existsByReview_ReviewId(Long reviewId);

    // 리뷰 번호를 기준으로 정비소 답변을 조회한다.
    Optional<ReviewReply> findByReview_ReviewId(Long reviewId);

    // 해당 리뷰에 작성된 정비소 답변을 삭제한다.
    void deleteByReview_ReviewId(Long reviewId);
}