package com.example.denti_back.controller;

import com.example.denti_back.ai.entity.AiAnalysis;
import com.example.denti_back.ai.service.AiEstimateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TestController {

    private final AiEstimateService aiEstimateService;

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "AI-Denti 백엔드 서버가 정상 작동 중입니다.");
        return response;
    }

    @PostMapping("/test/analyze")
    public Map<String, Object> testAnalyze(@RequestParam("image") MultipartFile image) throws IOException {
        return aiEstimateService.requestAnalysis(image);
    }

    @PostMapping("/test/analyze-save")
    public Map<String, Object> testAnalyzeAndSave(@RequestParam("image") MultipartFile image) throws IOException {
        AiAnalysis saved = aiEstimateService.analyzeAndSave(image);

        Map<String, Object> response = new HashMap<>();
        response.put("analysisId", saved.getAnalysisId());
        response.put("totalCost", saved.getTotalCost());
        response.put("message", "DB 저장 완료");
        return response;
    }
}