package com.example.denti_back.community.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 특정 게시글의 댓글 목록과 페이지 정보를 반환하는 DTO이다.
@Getter
@Setter
public class CommunityCommentListResponse {

    private Long postId;

    private long commentCount;

    private List<CommunityCommentResponse> comments;

    private int currentPage;

    private int totalPages;
}