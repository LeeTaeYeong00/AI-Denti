package com.example.denti_back.review.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// 정비소가 작성한 리뷰 답변 정보를 프론트에 전달하는 응답 DTO이다.
@Getter
@Setter
public class ReviewReplyResponse {

    // 정비소 답변의 기본키이다.
    private Long replyId;

    // 정비소가 작성한 답변 내용이다.
    private String content;

    // 답변이 처음 작성된 시간이다.
    private LocalDateTime createdAt;

    // 답변이 마지막으로 수정된 시간이다.
    // 아직 수정하지 않았다면 null이다.
    private LocalDateTime updatedAt;
}