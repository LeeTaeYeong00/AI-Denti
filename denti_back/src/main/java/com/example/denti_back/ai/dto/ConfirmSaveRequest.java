package com.example.denti_back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ConfirmSaveRequest {
    private String imageUrl;
    private Integer totalCost;
    private List<AiAnalysisDetailResponse> details;
}