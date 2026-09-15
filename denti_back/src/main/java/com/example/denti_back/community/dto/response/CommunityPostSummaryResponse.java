package com.example.denti_back.community.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 게시글 목록에 표시할 요약 정보이다.
@Getter
@Setter
public class CommunityPostSummaryResponse {

    private Long postId;

    private String title;

    private Long writerId;

    private String writerNickname;

    private List<CommunityWriterShopResponse> writerShops;

    private Long viewCount;

    private long likeCount;

    private long commentCount;

    // 첫 번째 첨부 이미지를 목록의 미리보기로 사용한다.
    // 이미지가 없다면 null이다.
    private String thumbnailUrl;

    private LocalDateTime createdAt;
}