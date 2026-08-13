package com.example.denti_back.review.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.denti_back.review.dto.response.ReviewImageResponse;
import com.example.denti_back.review.entity.Review;
import com.example.denti_back.review.entity.ReviewImage;
import com.example.denti_back.review.repository.ReviewImageRepository;
import com.example.denti_back.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewImageService {

    private static final int MAX_IMAGE_COUNT = 5;

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    // application.properties에 별도 설정이 없다면
    // 프로젝트의 uploads/reviews 폴더에 이미지를 저장한다.
    @Value("${file.review-upload-dir:uploads/reviews}")
    private String reviewUploadDir;

    // 리뷰 작성자가 해당 리뷰에 이미지를 추가한다.
    @Transactional
    public List<ReviewImageResponse> uploadImages(
            Long reviewId,
            Long currentUserId,
            List<MultipartFile> files) {

        Review review = findReview(reviewId);
        validateReviewWriter(review, currentUserId);

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException(
                    "업로드할 이미지를 선택해야 합니다.");
        }

        // 실제 파일이 들어 있는 항목만 추려낸다.
        List<MultipartFile> validFiles = files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            throw new IllegalArgumentException(
                    "업로드할 이미지를 선택해야 합니다.");
        }

        long currentImageCount =
                reviewImageRepository.countByReview_ReviewId(reviewId);

        // 기존 이미지와 새 이미지를 합쳐 최대 5장까지만 허용한다.
        if (currentImageCount + validFiles.size() > MAX_IMAGE_COUNT) {
            throw new IllegalArgumentException(
                    "리뷰 이미지는 최대 5장까지 등록할 수 있습니다.");
        }

        // 파일을 저장할 실제 폴더 경로를 준비한다.
        Path uploadPath = Paths.get(reviewUploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "이미지 저장 폴더를 생성할 수 없습니다.", e);
        }

        List<ReviewImageResponse> responses = new ArrayList<>();
        int displayOrder = (int) currentImageCount + 1;

        for (MultipartFile file : validFiles) {
            validateImageFile(file);

            String originalName = file.getOriginalFilename();
            String extension = extractExtension(originalName);

            // 파일명이 중복되지 않도록 UUID를 사용해 저장명을 만든다.
            String storedName = UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(storedName).normalize();

            try {
                Files.copy(
                        file.getInputStream(),
                        targetPath,
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new IllegalStateException(
                        "리뷰 이미지 저장에 실패했습니다.", e);
            }

            ReviewImage reviewImage = new ReviewImage();
            reviewImage.setReview(review);
            reviewImage.setOriginalName(originalName);
            reviewImage.setStoredName(storedName);
            reviewImage.setImageUrl(
                    "/uploads/reviews/" + storedName);
            reviewImage.setContentType(file.getContentType());
            reviewImage.setFileSize(file.getSize());
            reviewImage.setDisplayOrder(displayOrder++);

            ReviewImage savedImage =
                    reviewImageRepository.save(reviewImage);

            responses.add(toImageResponse(savedImage));
        }

        return responses;
    }

    // 리뷰 작성자가 등록한 이미지 한 장을 삭제한다.
    @Transactional
    public void deleteImage(
            Long reviewImageId,
            Long currentUserId) {

        ReviewImage reviewImage =
                reviewImageRepository.findById(reviewImageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "리뷰 이미지를 찾을 수 없습니다."));

        validateReviewWriter(
                reviewImage.getReview(),
                currentUserId);

        Path uploadPath = Paths.get(reviewUploadDir)
                .toAbsolutePath()
                .normalize();

        Path imagePath = uploadPath
                .resolve(reviewImage.getStoredName())
                .normalize();

        try {
            Files.deleteIfExists(imagePath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "리뷰 이미지 파일 삭제에 실패했습니다.", e);
        }

        reviewImageRepository.delete(reviewImage);
    }

    // 리뷰 번호를 이용하여 리뷰를 조회한다.
    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "리뷰를 찾을 수 없습니다."));
    }

    // 로그인 사용자가 해당 리뷰의 작성자인지 확인한다.
    private void validateReviewWriter(
            Review review,
            Long currentUserId) {

        Long writerId = review
                .getReservation()
                .getUser()
                .getUserId();

        if (!writerId.equals(currentUserId)) {
            throw new IllegalStateException(
                    "본인의 리뷰에만 이미지를 등록하거나 삭제할 수 있습니다.");
        }
    }

    // 업로드된 파일이 이미지 형식인지 확인한다.
    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "이미지 파일만 업로드할 수 있습니다.");
        }
    }

    // 원본 파일명에서 .jpg, .png 등의 확장자를 추출한다.
    private String extractExtension(String originalName) {
        if (originalName == null ||
                !originalName.contains(".")) {
            return "";
        }

        return originalName.substring(
                originalName.lastIndexOf("."));
    }

    // ReviewImage 엔티티를 응답 DTO로 변환한다.
    private ReviewImageResponse toImageResponse(
            ReviewImage reviewImage) {

        ReviewImageResponse response =
                new ReviewImageResponse();

        response.setReviewImageId(
                reviewImage.getReviewImageId());
        response.setOriginalName(
                reviewImage.getOriginalName());
        response.setImageUrl(
                reviewImage.getImageUrl());
        response.setDisplayOrder(
                reviewImage.getDisplayOrder());

        return response;
    }
}