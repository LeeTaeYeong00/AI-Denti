package com.example.denti_back.favorite.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.favorite.dto.ShopFavoriteResponse;
import com.example.denti_back.favorite.dto.ShopFavoriteStatusResponse;
import com.example.denti_back.favorite.entity.ShopFavorite;
import com.example.denti_back.favorite.repository.ShopFavoriteRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShopFavoriteService {

    private final ShopFavoriteRepository shopFavoriteRepository;
    private final UserRepository userRepository;
    private final RepairShopRepository repairShopRepository;

    // 현재 로그인한 사용자가 정비소를 즐겨찾기에 등록한다.
    @Transactional
    public ShopFavoriteResponse addFavorite(
            Long currentUserId,
            Long shopId
    ) {

        // 같은 정비소를 중복으로 즐겨찾기할 수 없도록 확인한다.
        if (shopFavoriteRepository
                .existsByUser_UserIdAndShop_ShopId(
                        currentUserId,
                        shopId
                )) {

            throw new IllegalStateException(
                    "이미 즐겨찾기에 등록된 정비소입니다."
            );
        }

        User user = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        RepairShop shop = repairShopRepository
                .findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비소를 찾을 수 없습니다."
                        )
                );

        ShopFavorite favorite = new ShopFavorite();

        favorite.setUser(user);
        favorite.setShop(shop);

        ShopFavorite savedFavorite =
                shopFavoriteRepository.save(favorite);

        return toFavoriteResponse(savedFavorite);
    }

    // 현재 로그인한 사용자가 정비소 즐겨찾기를 취소한다.
    @Transactional
    public void removeFavorite(
            Long currentUserId,
            Long shopId
    ) {

        ShopFavorite favorite = shopFavoriteRepository
                .findByUser_UserIdAndShop_ShopId(
                        currentUserId,
                        shopId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "즐겨찾기 정보를 찾을 수 없습니다."
                        )
                );

        shopFavoriteRepository.delete(favorite);
    }

    // 현재 사용자가 해당 정비소를 즐겨찾기했는지 조회한다.
    public ShopFavoriteStatusResponse getFavoriteStatus(
            Long currentUserId,
            Long shopId
    ) {

        boolean favorited = shopFavoriteRepository
                .existsByUser_UserIdAndShop_ShopId(
                        currentUserId,
                        shopId
                );

        ShopFavoriteStatusResponse response =
                new ShopFavoriteStatusResponse();

        response.setShopId(shopId);
        response.setFavorited(favorited);

        return response;
    }

    // 현재 사용자가 즐겨찾기한 정비소 목록을 조회한다.
    public List<ShopFavoriteResponse> getMyFavorites(
            Long currentUserId
    ) {

        return shopFavoriteRepository
                .findByUser_UserIdOrderByCreatedAtDesc(
                        currentUserId
                )
                .stream()
                .map(this::toFavoriteResponse)
                .toList();
    }

    // ShopFavorite 엔티티를 프론트에 전달할 DTO로 변환한다.
    private ShopFavoriteResponse toFavoriteResponse(
            ShopFavorite favorite
    ) {

        RepairShop shop = favorite.getShop();

        ShopFavoriteResponse response =
                new ShopFavoriteResponse();

        response.setFavoriteId(
                favorite.getFavoriteId()
        );

        response.setShopId(
                shop.getShopId()
        );

        response.setShopName(
                shop.getName()
        );

        response.setPhone(
                shop.getPhone()
        );

        response.setDescription(
                shop.getDescription()
        );

        response.setOpen(
                shop.isOpen()
        );

        response.setCreatedAt(
                favorite.getCreatedAt()
        );

        return response;
    }
}