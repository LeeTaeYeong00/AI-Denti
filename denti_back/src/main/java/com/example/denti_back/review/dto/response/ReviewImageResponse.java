package com.example.denti_back.review.dto.response;

import lombok.Getter;
import lombok.Setter;

// 리뷰에 첨부된 이미지 정보를 프론트에 전달하는 응답 DTO이다.
@Getter
@Setter
public class ReviewImageResponse {

    // 리뷰 이미지의 기본키이다.
    private Long reviewImageId;

    // 사용자가 업로드한 이미지의 원본 파일명이다.
    private String originalName;

    // 브라우저에서 이미지를 표시할 때 사용하는 이미지 주소이다.
    private String imageUrl;

    // 리뷰에 이미지가 여러 장일 때 화면에 표시할 순서이다.
    private Integer displayOrder;
}