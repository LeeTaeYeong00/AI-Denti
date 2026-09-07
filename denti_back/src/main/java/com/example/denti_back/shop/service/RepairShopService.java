package com.example.denti_back.shop.service;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.shop.dto.RepairShopRegisterRequestDto;
import com.example.denti_back.shop.dto.RepairShopUpdateRequestDto;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.entity.RepairShopAddress;
import com.example.denti_back.shop.enums.ApprovalStatus;
import com.example.denti_back.shop.repository.RepairShopAddressRepository;
import com.example.denti_back.shop.repository.RepairShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RepairShopService {

    private final RepairShopRepository repairShopRepository;
    private final RepairShopAddressRepository repairShopAddressRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public RepairShop registerRepairShop(User owner, RepairShopRegisterRequestDto request, MultipartFile businessDoc) throws IOException {
        String docUrl = saveDocumentToDisk(businessDoc);

        RepairShop shop = new RepairShop();
        shop.setOwner(owner);
        shop.setName(request.getName());
        shop.setPhone(request.getPhone());
        shop.setDescription(request.getDescription());
        shop.setOpen(true);
        shop.setApprovalStatus(ApprovalStatus.PENDING);
        shop.setBusinessDocUrl(docUrl);

        RepairShop savedShop = repairShopRepository.save(shop);

        RepairShopAddress address = new RepairShopAddress();
        address.setRepairShop(savedShop);
        address.setAddress(request.getAddress());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        repairShopAddressRepository.save(address);

        return savedShop;
    }

    @Transactional
    public RepairShop updateRepairShop(Long shopId, RepairShopUpdateRequestDto request) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        shop.setName(request.getName());
        shop.setPhone(request.getPhone());
        shop.setDescription(request.getDescription());

        if (request.getOpen() != null) {
            shop.setOpen(request.getOpen());
        }

        return shop;
    }

    // 정비소 삭제 (본인 소유 확인 후 삭제) - 신규
    @Transactional
    public void deleteRepairShop(Long shopId, User owner) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        if (!shop.getOwner().getUserId().equals(owner.getUserId())) {
            throw new IllegalArgumentException("본인 소유의 정비소만 삭제할 수 있습니다.");
        }

        repairShopAddressRepository.findByRepairShop_ShopId(shopId)
                .ifPresent(repairShopAddressRepository::delete);

        repairShopRepository.delete(shop);
    }

    // 반려된 정비소 수정 후 재등록 - 신규
    @Transactional
    public RepairShop resubmitRepairShop(Long shopId, User owner, RepairShopRegisterRequestDto request, MultipartFile businessDoc) throws IOException {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("정비소를 찾을 수 없습니다."));

        if (!shop.getOwner().getUserId().equals(owner.getUserId())) {
            throw new IllegalArgumentException("본인 소유의 정비소만 수정할 수 있습니다.");
        }

        if (shop.getApprovalStatus() != ApprovalStatus.REJECTED) {
            throw new IllegalStateException("반려된 정비소만 재등록할 수 있습니다.");
        }

        shop.setName(request.getName());
        shop.setPhone(request.getPhone());
        shop.setDescription(request.getDescription());
        shop.setApprovalStatus(ApprovalStatus.PENDING);
        shop.setRejectReason(null);

        if (businessDoc != null && !businessDoc.isEmpty()) {
            shop.setBusinessDocUrl(saveDocumentToDisk(businessDoc));
        }

        RepairShopAddress address = repairShopAddressRepository
                .findByRepairShop_ShopId(shopId)
                .orElseGet(() -> {
                    RepairShopAddress newAddress = new RepairShopAddress();
                    newAddress.setRepairShop(shop);
                    return newAddress;
                });
        address.setAddress(request.getAddress());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        repairShopAddressRepository.save(address);

        return shop;
    }

    private String saveDocumentToDisk(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("사업자등록증 등 증빙 서류를 첨부해주세요.");
        }

        String extension = getExtension(file.getOriginalFilename());
        String fileName = "doc_" + UUID.randomUUID() + extension;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        File dest = new File(dir, fileName);
        file.transferTo(dest);

        return "/uploads/ai/" + fileName;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".pdf";
        return filename.substring(filename.lastIndexOf("."));
    }
}