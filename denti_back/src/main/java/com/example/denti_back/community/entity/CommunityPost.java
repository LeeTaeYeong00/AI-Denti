package com.example.denti_back.community.entity;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// 자유게시판에 작성된 게시글 정보를 저장하는 엔티티이다.
@Entity
@Table(name = "community_post")
@Getter
@Setter
public class CommunityPost {

    // 게시글 기본키이며 데이터베이스에서 자동으로 증가한다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    // 게시글을 작성한 사용자이다.
    // 한 사용자는 여러 게시글을 작성할 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User writer;

    // 게시글 제목이다.
    @Column(nullable = false, length = 150)
    private String title;

    // 게시글 본문이다.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 게시글 상세 조회 횟수이다.
    @Column(nullable = false)
    private Long viewCount;

    // 게시글이 최초로 작성된 시간이다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 게시글이 마지막으로 수정된 시간이다.
    // 한 번도 수정하지 않았다면 null이다.
    private LocalDateTime updatedAt;

    // 게시글이 처음 저장되기 전에 초기값을 설정한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (viewCount == null) {
            viewCount = 0L;
        }
    }

    // 게시글이 수정되기 전에 수정 시간을 변경한다.
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}