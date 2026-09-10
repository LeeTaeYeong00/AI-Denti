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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// 사용자가 게시글에 누른 좋아요 정보를 저장하는 엔티티이다.
@Entity
@Table(
        name = "community_post_like",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_community_post_like_post_user",
                columnNames = {"post_id", "user_id"}
        )
)
@Getter
@Setter
public class CommunityPostLike {

    // 게시글 좋아요 기본키이다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postLikeId;

    // 좋아요가 등록된 게시글이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    // 좋아요를 누른 사용자이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 좋아요가 최초로 등록된 시간이다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 좋아요가 처음 저장되기 전에 등록 시간을 설정한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}