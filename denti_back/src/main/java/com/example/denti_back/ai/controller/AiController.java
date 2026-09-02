package com.example.denti_back.ai.controller;

import com.example.denti_back.ai.dto.AiAnalysisResponse;
import com.example.denti_back.ai.dto.AiAnalysisSummaryResponse;
import com.example.denti_back.ai.dto.ConfirmSaveRequest;
import com.example.denti_back.ai.service.AiEstimateService;
import com.example.denti_back.member.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiEstimateService aiEstimateService;

    // 1단계: 분석만 (DB 저장 안 함)
    @PostMapping("/analyze")
    public AiAnalysisResponse analyze(
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws IOException {
        return aiEstimateService.analyzePreview(image);
    }

    // 2단계: 저장 확정
    @PostMapping("/confirm-save")
    public AiAnalysisResponse confirmSave(
            @RequestBody ConfirmSaveRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return aiEstimateService.confirmSave(
                userDetails.getUser(),
                request.getImageUrl(),
                request.getTotalCost(),
                request.getDetails()
        );
    }

    @GetMapping("/history")
    public List<AiAnalysisSummaryResponse> history(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return aiEstimateService.getHistory(userDetails.getUser());
    }

    @GetMapping("/history/{analysisId}")
    public AiAnalysisResponse historyDetail(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return aiEstimateService.getDetail(analysisId, userDetails.getUser());
    }
}