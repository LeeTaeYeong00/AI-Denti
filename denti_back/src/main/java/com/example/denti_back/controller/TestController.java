package com.example.denti_back.controller;

import com.example.denti_back.ai.service.AiEstimateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private AiEstimateService aiEstimateService;

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "AI-Denti 백엔드 서버가 정상 작동 중입니다.");
        return response;
    }

    // 테스트 페이지 전용 - 이미지 받아서 AI 서버 호출 결과 그대로 반환
    @PostMapping("/test/analyze")
    public Map<String, Object> testAnalyze(@RequestParam("image") MultipartFile image) throws IOException {
        return aiEstimateService.requestAnalysis(image);
    }
}