package com.example.denti_back.review.dto.request;

import lombok.Getter;
import lombok.Setter;

// 정비소가 리뷰 답변을 등록하거나 수정할 때 전달하는 데이터를 받는 DTO이다.
@Getter
@Setter
public class ReviewReplyRequest {

    // 정비소가 작성한 답변 내용이다.
    // null 또는 공백인지 Service에서 검증한다.
    private String content;
}