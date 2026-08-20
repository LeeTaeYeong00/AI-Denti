package com.example.denti_back.ai.repository;

import com.example.denti_back.ai.entity.AiAnalysis;
import com.example.denti_back.ai.entity.AiAnalysisImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAnalysisImageRepository extends JpaRepository<AiAnalysisImage, Long> {
    List<AiAnalysisImage> findByAnalysis(AiAnalysis analysis);
}