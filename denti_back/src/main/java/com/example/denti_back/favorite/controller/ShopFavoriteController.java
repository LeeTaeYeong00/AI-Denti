package com.example.denti_back.favorite.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.favorite.dto.ShopFavoriteResponse;
import com.example.denti_back.favorite.dto.ShopFavoriteStatusResponse;
import com.example.denti_back.favorite.service.ShopFavoriteService;
import com.example.denti_back.member.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

// 정비소 즐겨찾기와 관련된 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class ShopFavoriteController {

    private final ShopFavoriteService shopFavoriteService;

    // 현재 로그인한 사용자가 정비소를 즐겨찾기에 등록한다.
    @PostMapping("/shops/{shopId}")
    public ResponseEntity<ShopFavoriteResponse> addFavorite(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ShopFavoriteResponse response =
                shopFavoriteService.addFavorite(
                        currentUserId,
                        shopId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 현재 로그인한 사용자가 정비소 즐겨찾기를 취소한다.
    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        shopFavoriteService.removeFavorite(
                currentUserId,
                shopId
        );

        return ResponseEntity.noContent().build();
    }

    // 현재 사용자가 해당 정비소를 즐겨찾기했는지 조회한다.
    @GetMapping("/shops/{shopId}/status")
    public ResponseEntity<ShopFavoriteStatusResponse>
    getFavoriteStatus(
            @PathVariable Long shopId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        ShopFavoriteStatusResponse response =
                shopFavoriteService.getFavoriteStatus(
                        currentUserId,
                        shopId
                );

        return ResponseEntity.ok(response);
    }

    // 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 조회한다.
    @GetMapping("/my")
    public ResponseEntity<List<ShopFavoriteResponse>>
    getMyFavorites(
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        List<ShopFavoriteResponse> responses =
                shopFavoriteService.getMyFavorites(
                        currentUserId
                );

        return ResponseEntity.ok(responses);
    }

    // 로그인 세션에서 현재 사용자의 번호를 가져온다.
    private Long getCurrentUserId(
            CustomUserDetails userDetails
    ) {

        if (userDetails == null) {
            throw new IllegalStateException(
                    "로그인 후 이용할 수 있습니다."
            );
        }

        return userDetails
                .getUser()
                .getUserId();
    }
}