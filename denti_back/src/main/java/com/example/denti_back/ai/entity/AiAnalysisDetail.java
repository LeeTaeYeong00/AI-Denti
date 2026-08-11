package com.example.denti_back.ai.entity;

import com.example.denti_back.ai.enums.DamageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AiAnalysisDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detailId;

    @ManyToOne
    @JoinColumn(name = "analysis_id")
    private AiAnalysis analysis;

    @Enumerated(EnumType.STRING)
    private DamageType damageType; // BREAKAGE, CRUSHED, SCRATCH, SEPARATED

    private Integer pixelArea;     // 코랩 결과의 "영역" (예: 8011)
    private Integer estimatedCost; // 픽셀 * 단가 (예: 801100)
}