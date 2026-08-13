package com.example.denti_back.review.dto.response;

import lombok.Getter;
import lombok.Setter;

// 리뷰의 좋아요 상태와 개수를 프론트에 전달하는 응답 DTO이다.
@Getter
@Setter
public class ReviewLikeResponse {

    // 좋아요 대상 리뷰의 번호이다.
    private Long reviewId;

    // 해당 리뷰가 받은 전체 좋아요 개수이다.
    private long likeCount;

    // 현재 로그인한 사용자가 이 리뷰에 좋아요를 눌렀는지 나타낸다.
    private boolean liked;
}