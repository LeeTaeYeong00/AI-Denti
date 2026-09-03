package com.example.denti_back.favorite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.favorite.entity.ShopFavorite;

public interface ShopFavoriteRepository
        extends JpaRepository<ShopFavorite, Long> {

    // 특정 사용자가 해당 정비소를 즐겨찾기했는지 확인한다.
    boolean existsByUser_UserIdAndShop_ShopId(
            Long userId,
            Long shopId
    );

    // 사용자 번호와 정비소 번호가 일치하는 즐겨찾기를 조회한다.
    Optional<ShopFavorite>
    findByUser_UserIdAndShop_ShopId(
            Long userId,
            Long shopId
    );

    // 즐겨찾기가 아직 존재하지 않을 때만 등록한다.
    // 동일한 즐겨찾기가 이미 존재하면 오류 없이 현재 상태를 유지한다.
    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query(
            value = """
                    INSERT IGNORE INTO shop_favorite
                        (user_id, shop_id, created_at)
                    VALUES
                        (:userId, :shopId, CURRENT_TIMESTAMP)
                    """,
            nativeQuery = true
    )
    int insertFavoriteIfAbsent(
            @Param("userId") Long userId,
            @Param("shopId") Long shopId
    );

    // 특정 사용자의 정비소 즐겨찾기를 삭제한다.
    // 이미 삭제된 상태라면 삭제 건수 0을 반환하고 오류는 발생하지 않는다.
    long deleteByUser_UserIdAndShop_ShopId(
            Long userId,
            Long shopId
    );

    // 특정 사용자가 즐겨찾기한 정비소 목록을 최근 등록순으로 조회한다.
    List<ShopFavorite>
    findByUser_UserIdOrderByCreatedAtDesc(
            Long userId
    );
}