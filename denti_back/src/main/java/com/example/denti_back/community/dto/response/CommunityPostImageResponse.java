package com.example.denti_back.community.dto.response;

import lombok.Getter;
import lombok.Setter;

// 게시글에 첨부된 이미지 정보를 반환하는 DTO이다.
@Getter
@Setter
public class CommunityPostImageResponse {

    private Long postImageId;

    private String originalName;

    private String imageUrl;

    private Integer displayOrder;
}