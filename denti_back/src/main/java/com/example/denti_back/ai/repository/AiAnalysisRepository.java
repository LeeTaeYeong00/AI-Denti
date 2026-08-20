package com.example.denti_back.ai.repository;

import com.example.denti_back.ai.entity.AiAnalysis;
import com.example.denti_back.member.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    List<AiAnalysis> findByUserOrderByCreatedAtDesc(User user);
}