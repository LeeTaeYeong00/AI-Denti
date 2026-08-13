package com.example.denti_back.review.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.review.entity.ReviewImage;

public interface ReviewImageRepository
        extends JpaRepository<ReviewImage, Long> {

    // 리뷰 번호를 기준으로 첨부 이미지를 출력 순서대로 조회한다.
    List<ReviewImage> findByReview_ReviewIdOrderByDisplayOrderAsc(
        Long reviewId
    );

    // 해당 리뷰에 현재 등록된 이미지 개수를 조회한다.
    long countByReview_ReviewId(Long reviewId);

    // 해당 리뷰에 첨부된 이미지 정보를 모두 삭제한다.
    void deleteByReview_ReviewId(Long reviewId);
}