package com.example.denti_back.review.dto.request;

import lombok.Getter;
import lombok.Setter;

// 사용자가 리뷰 등록을 요청할 때 전달하는 데이터를 받는 DTO이다.
@Getter
@Setter
public class ReviewCreateRequest {

    // 리뷰를 작성할 대상 예약의 번호이다.
    // 이 번호를 이용해 예약 정보, 사용자, 정비소 및 정비 완료 여부를 확인한다.
    private Long reservationId;

    // 사용자가 입력한 별점이다.
    // 1점부터 5점 사이인지 Service에서 검증한다.
    private Integer rating;

    // 사용자가 입력한 리뷰 본문이다.
    // null 또는 공백인지 Service에서 검증한다.
    private String content;
}