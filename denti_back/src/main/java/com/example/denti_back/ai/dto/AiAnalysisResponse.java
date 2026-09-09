package com.example.denti_back.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class AiAnalysisResponse {
    private Long analysisId;
    private Integer totalCost;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
    private List<AiAnalysisDetailResponse> details;
}