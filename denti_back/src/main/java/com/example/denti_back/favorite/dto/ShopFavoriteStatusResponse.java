package com.example.denti_back.favorite.dto;

import lombok.Getter;
import lombok.Setter;

// 정비소 상세 화면에 현재 사용자의 즐겨찾기 여부를 전달하는 DTO이다.
@Getter
@Setter
public class ShopFavoriteStatusResponse {

    // 즐겨찾기 여부를 확인한 정비소의 기본키이다.
    private Long shopId;

    // 현재 로그인한 사용자가 해당 정비소를 즐겨찾기했는지 나타낸다.
    private boolean favorited;
}