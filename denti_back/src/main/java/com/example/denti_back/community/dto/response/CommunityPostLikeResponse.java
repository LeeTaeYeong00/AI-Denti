package com.example.denti_back.community.dto.response;

import lombok.Getter;
import lombok.Setter;

// 게시글 좋아요 처리 결과를 반환하는 DTO이다.
@Getter
@Setter
public class CommunityPostLikeResponse {

    // 좋아요 대상 게시글 번호이다.
    private Long postId;

    // 게시글이 받은 전체 좋아요 개수이다.
    private long likeCount;

    // 현재 사용자가 이 게시글에 좋아요를 눌렀는지 나타낸다.
    private boolean liked;
}