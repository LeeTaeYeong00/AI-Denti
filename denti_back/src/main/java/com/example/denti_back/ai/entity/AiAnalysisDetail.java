package com.example.denti_back.ai.entity;

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

    private String damagePart;
    private Double damagePercentage;
    private Integer estimatedCost;
}