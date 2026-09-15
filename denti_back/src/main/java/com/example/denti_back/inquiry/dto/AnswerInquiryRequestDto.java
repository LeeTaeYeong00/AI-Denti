package com.example.denti_back.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AnswerInquiryRequestDto {

    @NotBlank
    private String answer;
}