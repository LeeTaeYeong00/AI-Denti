package com.example.denti_back.admin.dto;

import com.example.denti_back.admin.entity.ShopApprovalHistory;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ShopApprovalHistoryResponseDto {

    private Long historyId;
    private Long shopId;
    private String shopName;
    private String action;
    private String reason;
    private String adminNickName;
    private LocalDateTime processedAt;

    public ShopApprovalHistoryResponseDto(ShopApprovalHistory history) {
        this.historyId = history.getHistoryId();
        this.shopId = history.getShop().getShopId();
        this.shopName = history.getShop().getName();
        this.action = history.getAction().name();
        this.reason = history.getReason();
        this.adminNickName = history.getAdmin() != null ? history.getAdmin().getNickName() : null;
        this.processedAt = history.getProcessedAt();
    }
}