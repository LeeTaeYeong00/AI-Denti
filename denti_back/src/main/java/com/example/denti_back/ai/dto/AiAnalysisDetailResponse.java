package com.example.denti_back.ai.dto;

import com.example.denti_back.ai.enums.DamageType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalysisDetailResponse {
    private DamageType damageType;
    private Integer pixelArea;
    private Integer estimatedCost;
    private Double damagePercentage;
}