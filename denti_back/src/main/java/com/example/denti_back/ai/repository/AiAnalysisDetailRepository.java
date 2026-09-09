package com.example.denti_back.ai.repository;

import com.example.denti_back.ai.entity.AiAnalysis;
import com.example.denti_back.ai.entity.AiAnalysisDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAnalysisDetailRepository extends JpaRepository<AiAnalysisDetail, Long> {
    List<AiAnalysisDetail> findByAnalysis(AiAnalysis analysis);
}