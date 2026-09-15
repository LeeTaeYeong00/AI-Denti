package com.example.denti_back.inquiry.dto;

import com.example.denti_back.inquiry.enums.InquiryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class InquiryCreateRequestDto {

    @NotNull
    private InquiryType type;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String guestEmail; // 비로그인일 때만 필요

    private Long reportedUserId; // USER_REPORT일 때
    private Long reportedPostId; // 게시글에서 신고한 경우
}