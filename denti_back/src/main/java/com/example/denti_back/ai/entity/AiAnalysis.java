package com.example.denti_back.ai.entity;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long analysisId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle; // 차량 등록 기능 완성 전까지는 계속 null

    private Integer totalCost;

    @CreationTimestamp
    private LocalDateTime createdAt;
}