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

// 자유게시판 게시글에 작성된 댓글 정보를 저장하는 엔티티이다.
@Entity
@Table(name = "community_comment")
@Getter
@Setter
public class CommunityComment {

    // 댓글 기본키이며 데이터베이스에서 자동으로 증가한다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    // 댓글이 작성된 게시글이다.
    // 하나의 게시글에는 여러 댓글이 작성될 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    // 댓글을 작성한 사용자이다.
    // 한 사용자는 여러 댓글을 작성할 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User writer;

    // 사용자가 작성한 댓글 내용이다.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 댓글이 최초로 작성된 시간이다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 댓글이 마지막으로 수정된 시간이다.
    // 수정한 적이 없다면 null이다.
    private LocalDateTime updatedAt;

    // 댓글이 처음 저장되기 전에 작성 시간을 설정한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // 댓글이 수정되기 전에 수정 시간을 변경한다.
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}