package com.example.denti_back.community.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 게시글 상세 정보를 반환하는 DTO이다.
@Getter
@Setter
public class CommunityPostDetailResponse {

    private Long postId;

    private String title;

    private String content;

    private Long writerId;

    private String writerNickname;

    private List<CommunityWriterShopResponse> writerShops;

    private List<CommunityPostImageResponse> images;

    private Long viewCount;

    private long likeCount;

    // 현재 로그인한 사용자가 좋아요를 눌렀는지 나타낸다.
    // 비로그인 사용자라면 false이다.
    private boolean liked;

    private long commentCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}