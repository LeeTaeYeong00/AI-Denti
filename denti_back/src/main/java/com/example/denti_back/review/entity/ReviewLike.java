package com.example.denti_back.review.entity;

import java.time.LocalDateTime;

import com.example.denti_back.member.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// 사용자가 리뷰에 누른 좋아요 정보를 저장하는 JPA 엔티티이다.
@Entity
@Table(
    name = "review_like",

    // 동일한 사용자가 같은 리뷰에 좋아요를 중복으로 누르지 못하게 제한한다.
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_like_review_user",
        columnNames = {"review_id", "user_id"}
    )
)
@Getter
@Setter
public class ReviewLike {

    // 리뷰 좋아요 테이블의 기본키(PK)이며 DB에서 번호가 자동 증가한다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewLikeId;

    // 좋아요가 어떤 리뷰에 등록되었는지 연결한다.
    // 하나의 리뷰에는 여러 사용자가 좋아요를 누를 수 있으므로 ManyToOne 관계를 사용한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // 좋아요를 누른 사용자를 연결한다.
    // 한 사용자는 여러 리뷰에 좋아요를 누를 수 있으므로 ManyToOne 관계를 사용한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 좋아요가 등록된 시간이며 생성된 이후에는 변경하지 않는다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 좋아요가 DB에 처음 저장되기 직전에 등록 시간을 자동 입력한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}