package com.example.denti_back.review.entity;

import java.time.LocalDateTime;

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

// 사용자가 작성한 리뷰에 정비소가 남기는 공식 답변을 저장하는 JPA 엔티티이다.
@Entity
@Table(
    name = "review_reply",

    // review_id에 UNIQUE 제약조건을 적용하여
    // 하나의 리뷰에는 정비소 답변을 하나만 작성할 수 있도록 제한한다.
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_reply_review",
        columnNames = "review_id"
    )
)
@Getter
@Setter
public class ReviewReply {

    // 정비소 답변 테이블의 기본키(PK)이며 DB에서 번호가 자동 증가한다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long replyId;

    // 답변이 어떤 리뷰에 작성되었는지 연결한다.
    // 리뷰 하나당 공식 답변은 최대 하나이므로 OneToOne 관계를 사용한다.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // 정비소가 작성한 답변 본문이다.
    // 내용이 길어질 수 있으므로 DB의 TEXT 타입을 사용한다.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 답변이 최초로 작성된 시간이며 생성 이후에는 변경하지 않는다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 답변을 마지막으로 수정한 시간이며, 수정 전에는 null이다.
    private LocalDateTime updatedAt;

    // 답변이 DB에 처음 저장되기 직전에 작성 시간을 자동 입력한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // 기존 답변이 DB에서 수정되기 직전에 수정 시간을 자동 입력한다.
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}