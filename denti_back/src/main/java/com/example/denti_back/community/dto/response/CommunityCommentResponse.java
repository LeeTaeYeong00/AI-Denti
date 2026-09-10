package com.example.denti_back.community.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 댓글 한 건의 정보를 반환하는 DTO이다.
@Getter
@Setter
public class CommunityCommentResponse {

    private Long commentId;

    private Long postId;

    private Long writerId;

    private String writerNickname;

    // 댓글 작성자가 운영하는 승인된 정비소 목록이다.
    private List<CommunityWriterShopResponse> writerShops;

    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}