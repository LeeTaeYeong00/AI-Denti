package com.example.denti_back.community.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.community.dto.response.CommunityWriterShopResponse;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.enums.ApprovalStatus;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

// 게시글과 댓글 작성자가 소유한 승인 정비소 정보를 조회한다.
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityWriterShopService {

    private final RepairShopRepository repairShopRepository;

    // 작성자가 소유한 승인 정비소를 정비소 번호순으로 반환한다.
    public List<CommunityWriterShopResponse> getApprovedWriterShops(
            Long writerId
    ) {

        if (writerId == null) {
            return List.of();
        }

        return repairShopRepository
                .findByOwner_UserIdAndApprovalStatusOrderByShopIdAsc(
                        writerId,
                        ApprovalStatus.APPROVED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 정비소 Entity를 작성자 정비소 응답 DTO로 변환한다.
    private CommunityWriterShopResponse toResponse(
            RepairShop repairShop
    ) {

        CommunityWriterShopResponse response =
                new CommunityWriterShopResponse();

        response.setShopId(
                repairShop.getShopId()
        );
        response.setShopName(
                repairShop.getName()
        );

        return response;
    }
}