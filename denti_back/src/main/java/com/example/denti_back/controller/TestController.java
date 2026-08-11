package com.example.denti_back.controller;

import com.example.denti_back.ai.service.AiEstimateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

    // 테스트용 - AI 서버 연동 확인 끝나면 ai 도메인 컨트롤러로 옮길 예정
    @PostMapping("/test/analyze")
    public Map<String, Object> testAnalyze(@RequestParam("image") MultipartFile image) throws IOException {
        return aiEstimateService.requestAnalysis(image);
    }
}