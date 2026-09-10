package com.example.denti_back.community.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// 게시글 수정 요청 데이터를 받는 DTO이다.
@Getter
@Setter
public class CommunityPostUpdateRequest {

    @NotBlank(message = "게시글 제목을 입력해주세요.")
    @Size(
            max = 150,
            message = "게시글 제목은 150자 이하로 입력해주세요."
    )
    private String title;

    @NotBlank(message = "게시글 내용을 입력해주세요.")
    @Size(
            max = 10000,
            message = "게시글 내용은 10000자 이하로 입력해주세요."
    )
    private String content;
}