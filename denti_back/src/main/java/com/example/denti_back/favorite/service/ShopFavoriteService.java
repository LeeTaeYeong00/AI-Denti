package com.example.denti_back.favorite.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.favorite.dto.ShopFavoriteResponse;
import com.example.denti_back.favorite.dto.ShopFavoriteStatusResponse;
import com.example.denti_back.favorite.entity.ShopFavorite;
import com.example.denti_back.favorite.repository.ShopFavoriteRepository;
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

    // 현재 로그인한 사용자가 정비소를 즐겨찾기 상태로 만든다.
    // 이미 등록된 상태라면 추가로 저장하지 않고 현재 정보를 반환한다.
    @Transactional
    public ShopFavoriteResponse addFavorite(
            Long currentUserId,
            Long shopId
    ) {

        validateCurrentUser(currentUserId);
        validateShop(shopId);

        shopFavoriteRepository.insertFavoriteIfAbsent(
                currentUserId,
                shopId
        );

        ShopFavorite favorite = shopFavoriteRepository
                .findByUser_UserIdAndShop_ShopId(
                        currentUserId,
                        shopId
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "즐겨찾기 정보를 확인할 수 없습니다."
                        )
                );

        return toFavoriteResponse(favorite);
    }

    // 현재 로그인한 사용자가 정비소를 즐겨찾기 해제 상태로 만든다.
    // 이미 해제된 상태여도 오류 없이 정상 처리한다.
    @Transactional
    public void removeFavorite(
            Long currentUserId,
            Long shopId
    ) {

        validateCurrentUser(currentUserId);

        shopFavoriteRepository
                .deleteByUser_UserIdAndShop_ShopId(
                        currentUserId,
                        shopId
                );
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

    // 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 조회한다.
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

    // 로그인 사용자 정보와 실제 사용자 존재 여부를 확인한다.
    private void validateCurrentUser(
            Long currentUserId
    ) {

        if (currentUserId == null) {
            throw new IllegalStateException(
                    "로그인 후 즐겨찾기를 이용할 수 있습니다."
            );
        }

        if (!userRepository.existsById(currentUserId)) {
            throw new IllegalArgumentException(
                    "사용자를 찾을 수 없습니다."
            );
        }
    }

    // 정비소가 실제로 존재하는지 확인한다.
    private void validateShop(
            Long shopId
    ) {

        if (shopId == null ||
                !repairShopRepository.existsById(shopId)) {

            throw new IllegalArgumentException(
                    "정비소를 찾을 수 없습니다."
            );
        }
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