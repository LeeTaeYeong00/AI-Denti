package com.example.denti_back.inquiry.dto;

import com.example.denti_back.inquiry.entity.Inquiry;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class InquiryResponseDto {

    private Long inquiryId;
    private String type;
    private String title;
    private String content;
    private String status;
    private String answer;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;

    private String authorNickName; // 비로그인이면 null
    private String reportedUserNickName; // 없으면 null
    private Long reportedPostId; // 없으면 null

    public InquiryResponseDto(Inquiry inquiry) {
        this.inquiryId = inquiry.getInquiryId();
        this.type = inquiry.getType().name();
        this.title = inquiry.getTitle();
        this.content = inquiry.getContent();
        this.status = inquiry.getStatus().name();
        this.answer = inquiry.getAnswer();
        this.answeredAt = inquiry.getAnsweredAt();
        this.createdAt = inquiry.getCreatedAt();
        this.authorNickName = inquiry.getAuthor() != null ? inquiry.getAuthor().getNickName() : null;
        this.reportedUserNickName = inquiry.getReportedUser() != null ? inquiry.getReportedUser().getNickName() : null;
        this.reportedPostId = inquiry.getReportedPost() != null ? inquiry.getReportedPost().getPostId() : null;
    }
}