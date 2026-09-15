package com.example.denti_back.community.entity;

import java.time.LocalDateTime;

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
import lombok.Getter;
import lombok.Setter;

// 게시글에 첨부된 이미지 정보를 저장하는 엔티티이다.
// 실제 이미지 파일이 아니라 파일 정보와 접근 주소를 DB에 저장한다.
@Entity
@Table(name = "community_post_image")
@Getter
@Setter
public class CommunityPostImage {

    // 게시글 이미지 기본키이다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postImageId;

    // 이미지가 첨부된 게시글이다.
    // 하나의 게시글에는 최대 3장의 이미지가 등록될 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    // 사용자가 업로드할 때 사용한 원본 파일명이다.
    @Column(nullable = false)
    private String originalName;

    // 파일명 중복 방지를 위해 서버에서 사용하는 UUID 파일명이다.
    @Column(nullable = false)
    private String storedName;

    // 브라우저에서 이미지를 조회할 때 사용하는 접근 주소이다.
    @Column(nullable = false, length = 1000)
    private String imageUrl;

    // 이미지 MIME 타입이다.
    // image/jpeg 또는 image/png 값이 저장된다.
    @Column(nullable = false, length = 100)
    private String contentType;

    // 이미지 파일 크기를 byte 단위로 저장한다.
    @Column(nullable = false)
    private Long fileSize;

    // 여러 이미지를 화면에 표시할 순서이다.
    @Column(nullable = false)
    private Integer displayOrder;

    // 이미지가 등록된 시간이다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 이미지 정보가 처음 저장되기 전에 등록 시간을 설정한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}