package com.example.denti_back.review.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewImageService {

    // 한 리뷰에 등록할 수 있는 최대 이미지 개수이다.
    private static final int MAX_IMAGE_COUNT = 5;

    // 이미지 한 장당 최대 크기는 5MB이다.
    private static final long MAX_IMAGE_SIZE =
            5L * 1024 * 1024;

    // 이미지 5장의 최대 합계 크기는 25MB이다.
    private static final long MAX_TOTAL_IMAGE_SIZE =
            MAX_IMAGE_SIZE * MAX_IMAGE_COUNT;

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
                .filter(file ->
                        file != null &&
                        !file.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            throw new IllegalArgumentException(
                    "업로드할 이미지를 선택해야 합니다.");
        }

        long currentImageCount =
                reviewImageRepository
                        .countByReview_ReviewId(reviewId);

        // 기존 이미지와 새 이미지를 합쳐 최대 5장까지만 허용한다.
        if (currentImageCount + validFiles.size()
                > MAX_IMAGE_COUNT) {

            throw new IllegalArgumentException(
                    "리뷰 이미지는 최대 5장까지 등록할 수 있습니다.");
        }

        long totalFileSize = validFiles.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();

        // 한 번에 선택한 이미지의 합계 크기를 확인한다.
        if (totalFileSize > MAX_TOTAL_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "리뷰 이미지의 전체 크기는 25MB를 초과할 수 없습니다.");
        }

        // 파일을 저장하기 전에 모든 파일을 먼저 검사한다.
        // 하나라도 문제가 있으면 어떤 파일도 저장하지 않는다.
        for (MultipartFile file : validFiles) {
            validateImageFile(file);
        }

        // 파일을 저장할 실제 폴더 경로를 준비한다.
        Path uploadPath = Paths.get(reviewUploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "이미지 저장 폴더를 생성할 수 없습니다.",
                    e);
        }

        List<ReviewImageResponse> responses =
                new ArrayList<>();

        // 다중 이미지 저장 중 오류가 발생했을 때
        // 이미 저장된 실제 파일을 정리하기 위해 경로를 보관한다.
        List<Path> savedFilePaths =
                new ArrayList<>();

        int displayOrder =
                (int) currentImageCount + 1;

        try {
            for (MultipartFile file : validFiles) {
                String originalName =
                        file.getOriginalFilename();

                String extension =
                        extractExtension(originalName);

                // 파일명이 중복되지 않도록 UUID를 사용한다.
                String storedName =
                        UUID.randomUUID() + extension;

                Path targetPath = uploadPath
                        .resolve(storedName)
                        .normalize();

                Files.copy(
                        file.getInputStream(),
                        targetPath,
                        StandardCopyOption.REPLACE_EXISTING);

                savedFilePaths.add(targetPath);

                ReviewImage reviewImage =
                        new ReviewImage();

                reviewImage.setReview(review);
                reviewImage.setOriginalName(originalName);
                reviewImage.setStoredName(storedName);
                reviewImage.setImageUrl(
                        "/uploads/reviews/" + storedName);
                reviewImage.setContentType(
                        file.getContentType());
                reviewImage.setFileSize(
                        file.getSize());
                reviewImage.setDisplayOrder(
                        displayOrder++);

                ReviewImage savedImage =
                        reviewImageRepository.save(
                                reviewImage);

                responses.add(
                        toImageResponse(savedImage));
            }
        } catch (IOException | RuntimeException e) {
            // 파일 또는 DB 저장 중 하나라도 실패하면
            // 이번 요청에서 먼저 저장된 실제 파일을 모두 정리한다.
            deleteFilesQuietly(savedFilePaths);

            throw new IllegalStateException(
                    "리뷰 이미지 저장에 실패했습니다.",
                    e);
        }

        return responses;
    }

    // 리뷰 작성자가 등록한 이미지 한 장을 삭제한다.
    @Transactional
    public void deleteImage(
            Long reviewImageId,
            Long currentUserId) {

        ReviewImage reviewImage =
                reviewImageRepository
                        .findById(reviewImageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "리뷰 이미지를 찾을 수 없습니다."));

        validateReviewWriter(
                reviewImage.getReview(),
                currentUserId);

        deleteStoredImageFile(reviewImage);

        reviewImageRepository.delete(reviewImage);
    }

    // 리뷰 전체가 삭제될 때 연결된 모든 실제 이미지와 DB 정보를 삭제한다.
    // 호출하는 ReviewService에서 리뷰 작성자 검증을 먼저 수행한다.
    @Transactional
    public void deleteAllImagesByReviewId(
            Long reviewId) {

        List<ReviewImage> reviewImages =
                reviewImageRepository
                        .findByReview_ReviewIdOrderByDisplayOrderAsc(
                                reviewId);

        for (ReviewImage reviewImage : reviewImages) {
            deleteStoredImageFile(reviewImage);
        }

        reviewImageRepository.deleteAll(reviewImages);
    }

    // 서버에 저장된 실제 리뷰 이미지 파일 한 장을 삭제한다.
    private void deleteStoredImageFile(
            ReviewImage reviewImage) {

        Path uploadPath = Paths.get(reviewUploadDir)
                .toAbsolutePath()
                .normalize();

        Path imagePath = uploadPath
                .resolve(reviewImage.getStoredName())
                .normalize();

        // 저장 폴더 바깥의 파일이 삭제되지 않도록 경로를 확인한다.
        if (!imagePath.startsWith(uploadPath)) {
            throw new IllegalStateException(
                    "리뷰 이미지 파일 경로가 올바르지 않습니다.");
        }

        try {
            Files.deleteIfExists(imagePath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "리뷰 이미지 파일 삭제에 실패했습니다.",
                    e);
        }
    }

    // 다중 업로드 실패 시 먼저 저장된 파일을 가능한 범위에서 정리한다.
    private void deleteFilesQuietly(
            List<Path> filePaths) {

        for (Path filePath : filePaths) {
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException cleanupError) {
                log.warn(
                        "업로드 실패 후 리뷰 이미지 파일을 정리하지 못했습니다: {}",
                        filePath,
                        cleanupError);
            }
        }
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

    // 이미지 크기, 확장자, MIME 타입과 실제 내용을 확인한다.
    private void validateImageFile(
            MultipartFile file) {

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "이미지 한 장의 크기는 5MB를 초과할 수 없습니다.");
        }

        String originalName =
                file.getOriginalFilename();

        String extension =
                extractExtension(originalName);

        boolean jpegExtension =
                ".jpg".equals(extension) ||
                ".jpeg".equals(extension);

        boolean pngExtension =
                ".png".equals(extension);

        if (!jpegExtension && !pngExtension) {
            throw new IllegalArgumentException(
                    "JPG, JPEG, PNG 파일만 업로드할 수 있습니다.");
        }

        String contentType =
                file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException(
                    "파일 형식을 확인할 수 없습니다.");
        }

        String normalizedContentType =
                contentType.toLowerCase(Locale.ROOT);

        boolean jpegContentType =
                "image/jpeg".equals(
                        normalizedContentType) ||
                "image/jpg".equals(
                        normalizedContentType);

        boolean pngContentType =
                "image/png".equals(
                        normalizedContentType);

        // 확장자와 브라우저가 전달한 MIME 타입이 일치하는지 확인한다.
        if (jpegExtension && !jpegContentType) {
            throw new IllegalArgumentException(
                    "JPG 파일의 형식이 올바르지 않습니다.");
        }

        if (pngExtension && !pngContentType) {
            throw new IllegalArgumentException(
                    "PNG 파일의 형식이 올바르지 않습니다.");
        }

        // 파일의 실제 시작 바이트를 확인한다.
        validateFileSignature(
                file,
                extension);
    }

    // JPG 또는 PNG 파일의 실제 시그니처를 확인한다.
    private void validateFileSignature(
            MultipartFile file,
            String extension) {

        try (InputStream inputStream =
                     file.getInputStream()) {

            byte[] header =
                    inputStream.readNBytes(8);

            boolean validSignature;

            if (".jpg".equals(extension) ||
                    ".jpeg".equals(extension)) {

                validSignature =
                        isJpegSignature(header);
            } else {
                validSignature =
                        isPngSignature(header);
            }

            if (!validSignature) {
                throw new IllegalArgumentException(
                        "확장자와 실제 이미지 파일 형식이 일치하지 않습니다.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "이미지 파일의 내용을 확인할 수 없습니다.",
                    e);
        }
    }

    // JPG 파일은 FF D8 FF 바이트로 시작한다.
    private boolean isJpegSignature(
            byte[] header) {

        return header.length >= 3 &&
                (header[0] & 0xFF) == 0xFF &&
                (header[1] & 0xFF) == 0xD8 &&
                (header[2] & 0xFF) == 0xFF;
    }

    // PNG 파일의 고정된 시작 바이트를 확인한다.
    private boolean isPngSignature(
            byte[] header) {

        return header.length >= 8 &&
                (header[0] & 0xFF) == 0x89 &&
                (header[1] & 0xFF) == 0x50 &&
                (header[2] & 0xFF) == 0x4E &&
                (header[3] & 0xFF) == 0x47 &&
                (header[4] & 0xFF) == 0x0D &&
                (header[5] & 0xFF) == 0x0A &&
                (header[6] & 0xFF) == 0x1A &&
                (header[7] & 0xFF) == 0x0A;
    }

    // 원본 파일명에서 확장자를 추출해 소문자로 반환한다.
    private String extractExtension(
            String originalName) {

        if (originalName == null ||
                !originalName.contains(".")) {

            return "";
        }

        return originalName
                .substring(
                        originalName.lastIndexOf("."))
                .toLowerCase(Locale.ROOT);
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
