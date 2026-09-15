package com.example.denti_back.admin.controller;

import com.example.denti_back.inquiry.dto.AnswerInquiryRequestDto;
import com.example.denti_back.inquiry.dto.InquiryResponseDto;
import com.example.denti_back.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryService.getAllInquiries();
    }

    @PutMapping("/{inquiryId}/answer")
    public InquiryResponseDto answerInquiry(
            @PathVariable Long inquiryId,
            @RequestBody @Valid AnswerInquiryRequestDto request
    ) {
        return inquiryService.answerInquiry(inquiryId, request.getAnswer());
    }
}