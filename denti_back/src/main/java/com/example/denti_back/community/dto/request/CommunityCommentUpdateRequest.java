package com.example.denti_back.community.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// 댓글 수정 요청 데이터를 받는 DTO이다.
@Getter
@Setter
public class CommunityCommentUpdateRequest {

    @NotBlank(message = "댓글 내용을 입력해주세요.")
    @Size(
            max = 1000,
            message = "댓글은 1000자 이하로 작성해주세요."
    )
    private String content;
}