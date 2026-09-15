package com.example.denti_back.inquiry.repository;

import com.example.denti_back.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByAuthor_UserIdOrderByCreatedAtDesc(Long userId);
    List<Inquiry> findAllByOrderByCreatedAtDesc();
}