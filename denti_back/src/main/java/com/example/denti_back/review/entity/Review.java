package com.example.denti_back.review.entity;

import java.time.LocalDateTime;

import com.example.denti_back.reservation.entity.Reservation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// 이 클래스가 데이터베이스의 테이블과 연결되는 JPA 엔티티임을 나타낸다.
@Entity
@Table(
    name = "review",

    // 하나의 예약에는 리뷰를 하나만 작성할 수 있도록 제한한다.
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_reservation",
        columnNames = "reservation_id"
    )
)
@Getter
@Setter
public class Review {

    // 리뷰 테이블의 기본키(PK)이며,
    // 데이터베이스가 번호를 자동으로 증가시킨다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    // 리뷰가 어떤 예약에서 작성되었는지 연결한다.
    // 예약 한 건당 리뷰는 최대 한 개이며,
    // 예약 없이 리뷰를 작성할 수 없다.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    // 사용자가 입력한 별점이다.
    // 1점부터 5점까지만 허용하는 검증은 Service에서 처리한다.
    @Column(nullable = false)
    private Integer rating;

    // 리뷰 본문이다.
    // 내용이 길어질 수 있으므로 데이터베이스의 TEXT 타입을 사용한다.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 리뷰가 최초로 작성된 시간이다.
    // 생성된 이후에는 변경하지 않는다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 리뷰를 마지막으로 수정한 시간이다.
    // 아직 수정하지 않은 리뷰라면 null이다.
    private LocalDateTime updatedAt;

    // 리뷰가 데이터베이스에 처음 저장되기 직전에
    // 작성 시간을 자동으로 입력한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // 기존 리뷰가 데이터베이스에서 수정되기 직전에
    // 수정 시간을 자동으로 입력한다.
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}