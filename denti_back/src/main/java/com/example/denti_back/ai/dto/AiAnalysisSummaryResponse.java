package com.example.denti_back.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AiAnalysisSummaryResponse {
    private Long analysisId;
    private Integer totalCost;
    private LocalDateTime createdAt;
    private String thumbnailUrl;
}