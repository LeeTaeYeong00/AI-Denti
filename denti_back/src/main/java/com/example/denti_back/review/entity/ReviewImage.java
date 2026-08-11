package com.example.denti_back.review.entity;

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

// 리뷰에 첨부된 이미지 정보를 저장하는 JPA 엔티티이다.
// 실제 이미지 파일이 아니라 파일명, 저장 경로, 크기 등의 정보만 DB에 저장한다.
@Entity
@Table(name = "review_image")
@Getter
@Setter
public class ReviewImage {

    // 리뷰 이미지 테이블의 기본키(PK)이며 DB에서 번호가 자동 증가한다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewImageId;

    // 이미지가 어떤 리뷰에 첨부되었는지 연결한다.
    // 하나의 리뷰에는 여러 이미지가 들어갈 수 있으므로 ManyToOne 관계를 사용한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // 사용자가 업로드할 때 사용한 원본 파일명이다.
    @Column(nullable = false)
    private String originalName;

    // 파일명 중복을 방지하기 위해 서버 또는 저장소에서 사용하는 고유 파일명이다.
    @Column(nullable = false)
    private String storedName;

    // 브라우저에서 이미지를 불러올 때 사용하는 접근 주소이다.
    @Column(nullable = false, length = 1000)
    private String imageUrl;

    // 업로드된 파일의 형식이다. 예: image/jpeg, image/png
    @Column(nullable = false, length = 100)
    private String contentType;

    // 업로드 용량을 확인할 수 있도록 파일 크기를 byte 단위로 저장한다.
    @Column(nullable = false)
    private Long fileSize;

    // 여러 장의 이미지를 화면에 표시할 순서를 저장한다.
    @Column(nullable = false)
    private Integer displayOrder;

    // 이미지 정보가 최초로 등록된 시간이며 생성 이후에는 변경하지 않는다.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 이미지 정보가 DB에 처음 저장되기 직전에 등록 시간을 자동 입력한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}