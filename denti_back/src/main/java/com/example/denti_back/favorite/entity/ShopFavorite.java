package com.example.denti_back.favorite.entity;

import java.time.LocalDateTime;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.entity.RepairShop;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// 사용자가 즐겨찾기에 등록한 정비소 정보를 저장하는 엔티티이다.
@Entity
@Table(
        name = "shop_favorite",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_shop_favorite_user_shop",
                columnNames = {
                        "user_id",
                        "shop_id"
                }
        )
)
@Getter
@Setter
public class ShopFavorite {

    // 정비소 즐겨찾기 테이블의 기본키이다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;

    // 정비소를 즐겨찾기에 등록한 사용자이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // 사용자가 즐겨찾기에 등록한 정비소이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "shop_id",
            nullable = false
    )
    private RepairShop shop;

    // 사용자가 정비소를 즐겨찾기에 등록한 시간이다.
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    // 데이터베이스에 처음 저장되기 직전에 등록 시간을 입력한다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}