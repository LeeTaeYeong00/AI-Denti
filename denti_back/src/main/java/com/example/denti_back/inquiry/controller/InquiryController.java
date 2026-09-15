package com.example.denti_back.inquiry.controller;

import com.example.denti_back.inquiry.dto.InquiryCreateRequestDto;
import com.example.denti_back.inquiry.dto.InquiryResponseDto;
import com.example.denti_back.inquiry.service.InquiryService;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    // 문의 작성 (로그인/비로그인 둘 다 가능)
    @PostMapping
    public InquiryResponseDto createInquiry(
            @RequestBody @Valid InquiryCreateRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User loginUser = userDetails != null ? userDetails.getUser() : null;
        return inquiryService.createInquiry(loginUser, request);
    }

    // 내 문의 목록 조회
    @GetMapping("/my")
    public List<InquiryResponseDto> getMyInquiries(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return inquiryService.getMyInquiries(userDetails.getUser().getUserId());
    }
}