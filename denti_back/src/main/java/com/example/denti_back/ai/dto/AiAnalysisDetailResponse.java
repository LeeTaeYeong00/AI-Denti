package com.example.denti_back.ai.dto;

import com.example.denti_back.ai.enums.DamageType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AiAnalysisDetailResponse {
    private DamageType damageType;
    private Integer pixelArea;
    private Integer estimatedCost;
    private Double damagePercentage;
}