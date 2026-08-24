package com.example.denti_back.favorite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.favorite.entity.ShopFavorite;

public interface ShopFavoriteRepository
        extends JpaRepository<ShopFavorite, Long> {

    // 특정 사용자가 해당 정비소를 즐겨찾기했는지 확인한다.
    boolean existsByUser_UserIdAndShop_ShopId(
            Long userId,
            Long shopId
    );

    // 사용자 번호와 정비소 번호가 일치하는 즐겨찾기를 조회한다.
    // 즐겨찾기를 취소할 때 사용한다.
    Optional<ShopFavorite> findByUser_UserIdAndShop_ShopId(
            Long userId,
            Long shopId
    );

    // 특정 사용자가 즐겨찾기한 정비소 목록을 최근 등록순으로 조회한다.
    List<ShopFavorite> findByUser_UserIdOrderByCreatedAtDesc(
            Long userId
    );
}