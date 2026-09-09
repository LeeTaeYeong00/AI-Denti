package com.example.denti_back.review.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 현재 로그인한 사용자가 작성한 리뷰 목록을 프론트에 전달하는 DTO이다.
@Getter
@Setter
public class MyReviewResponse {

    // 리뷰를 작성한 현재 사용자의 번호이다.
    private Long userId;

    // 현재 사용자가 작성한 전체 리뷰 개수이다.
    private long reviewCount;

    // 현재 페이지에서 조회된 리뷰 목록이다.
    private List<ReviewResponse> reviews;

    // 현재 조회하고 있는 페이지 번호이다.
    // 첫 번째 페이지는 0부터 시작한다.
    private int currentPage;

    // 전체 페이지 수이다.
    private int totalPages;
}