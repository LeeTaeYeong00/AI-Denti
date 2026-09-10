package com.example.denti_back.community.dto.response;

import lombok.Getter;
import lombok.Setter;

// 게시글 또는 댓글 작성자가 운영하는 승인된 정비소 정보이다.
@Getter
@Setter
public class CommunityWriterShopResponse {

    private Long shopId;

    private String shopName;
}