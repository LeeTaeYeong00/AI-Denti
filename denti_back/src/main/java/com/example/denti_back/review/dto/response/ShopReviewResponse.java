package com.example.denti_back.review.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 특정 정비소의 리뷰 통계와 리뷰 목록을 프론트에 전달하는 응답 DTO이다.
@Getter
@Setter
public class ShopReviewResponse {

    // 리뷰를 조회한 정비소의 번호이다.
    private Long shopId;

    // 해당 정비소에 작성된 리뷰들의 평균 별점이다.
    private Double averageRating;

    // 해당 정비소에 작성된 전체 리뷰 개수이다.
    private long reviewCount;

    // 현재 페이지에 포함된 리뷰 목록이다.
    private List<ReviewResponse> reviews;

    // 현재 조회하고 있는 페이지 번호이다.
    private int currentPage;

    // 전체 페이지 수이다.
    private int totalPages;
}