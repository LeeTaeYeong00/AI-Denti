package com.example.denti_back.review.dto.request;

import lombok.Getter;
import lombok.Setter;

// 사용자가 기존 리뷰를 수정할 때 전달하는 데이터를 받는 DTO이다.
@Getter
@Setter
public class ReviewUpdateRequest {

    // 수정할 별점이다.
    // 1점부터 5점 사이인지 Service에서 검증한다.
    private Integer rating;

    // 수정할 리뷰 본문이다.
    // null 또는 공백인지 Service에서 검증한다.
    private String content;
}