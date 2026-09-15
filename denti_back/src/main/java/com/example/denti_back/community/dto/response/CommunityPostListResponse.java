package com.example.denti_back.community.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 페이지 단위로 조회한 게시글 목록을 반환하는 DTO이다.
@Getter
@Setter
public class CommunityPostListResponse {

    private List<CommunityPostSummaryResponse> posts;

    private int currentPage;

    private int totalPages;

    private long totalElements;
}