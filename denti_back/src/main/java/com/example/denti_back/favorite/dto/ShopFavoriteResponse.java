package com.example.denti_back.favorite.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// 사용자가 즐겨찾기한 정비소 정보를 프론트에 전달하는 DTO이다.
@Getter
@Setter
public class ShopFavoriteResponse {

    // 즐겨찾기 테이블의 기본키이다.
    private Long favoriteId;

    // 즐겨찾기한 정비소의 기본키이다.
    private Long shopId;

    // 즐겨찾기한 정비소의 이름이다.
    private String shopName;

    // 정비소 전화번호이다.
    private String phone;

    // 정비소 소개 내용이다.
    private String description;

    // 현재 정비소가 영업 중인지 나타낸다.
    private boolean open;

    // 사용자가 정비소를 즐겨찾기에 등록한 시간이다.
    private LocalDateTime createdAt;
}