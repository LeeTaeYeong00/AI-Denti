package com.example.denti_back.community.service;

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

import com.example.denti_back.community.dto.response.CommunityPostImageResponse;
import com.example.denti_back.community.entity.CommunityPost;
import com.example.denti_back.community.entity.CommunityPostImage;
import com.example.denti_back.community.repository.CommunityPostImageRepository;
import com.example.denti_back.community.repository.CommunityPostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CommunityPostImageService {

    // 한 게시글에 등록할 수 있는 최대 이미지 개수이다.
    private static final int MAX_IMAGE_COUNT = 3;

    // 이미지 한 장당 최대 크기는 5MB이다.
    private static final long MAX_IMAGE_SIZE =
            5L * 1024 * 1024;

    // 이미지 3장의 최대 합계 크기는 15MB이다.
    private static final long MAX_TOTAL_IMAGE_SIZE =
            MAX_IMAGE_SIZE * MAX_IMAGE_COUNT;

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostImageRepository communityPostImageRepository;

    @Value("${file.community-upload-dir:uploads/community}")
    private String communityUploadDir;

    // 게시글 작성자가 해당 게시글에 이미지를 추가한다.
    @Transactional
    public List<CommunityPostImageResponse> uploadImages(
            Long postId,
            Long currentUserId,
            List<MultipartFile> files
    ) {

        CommunityPost post = findPost(postId);
        validatePostWriter(post, currentUserId);

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException(
                    "업로드할 이미지를 선택해야 합니다."
            );
        }

        // 실제 파일이 들어 있는 항목만 추려낸다.
        List<MultipartFile> validFiles = files.stream()
                .filter(file ->
                        file != null && !file.isEmpty()
                )
                .toList();

        if (validFiles.isEmpty()) {
            throw new IllegalArgumentException(
                    "업로드할 이미지를 선택해야 합니다."
            );
        }

        long currentImageCount =
                communityPostImageRepository
                        .countByPost_PostId(postId);

        if (currentImageCount + validFiles.size()
                > MAX_IMAGE_COUNT) {

            throw new IllegalArgumentException(
                    "게시글 이미지는 최대 3장까지 등록할 수 있습니다."
            );
        }

        long totalFileSize = validFiles.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();

        if (totalFileSize > MAX_TOTAL_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "게시글 이미지의 전체 크기는 15MB를 초과할 수 없습니다."
            );
        }

        // 저장을 시작하기 전에 모든 파일을 먼저 검사한다.
        for (MultipartFile file : validFiles) {
            validateImageFile(file);
        }

        Path uploadPath = Paths.get(communityUploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "게시글 이미지 저장 폴더를 생성할 수 없습니다.",
                    e
            );
        }

        List<CommunityPostImageResponse> responses =
                new ArrayList<>();

        // 업로드 도중 실패했을 때 실제 파일을 정리하기 위해 경로를 보관한다.
        List<Path> savedFilePaths =
                new ArrayList<>();

        Integer maxDisplayOrder =
                communityPostImageRepository
                        .findMaxDisplayOrderByPostId(postId);

        int displayOrder = maxDisplayOrder + 1;

        try {
            for (MultipartFile file : validFiles) {
                String originalName =
                        file.getOriginalFilename();

                String extension =
                        extractExtension(originalName);

                String storedName =
                        UUID.randomUUID() + extension;

                Path targetPath = uploadPath
                        .resolve(storedName)
                        .normalize();

                if (!targetPath.startsWith(uploadPath)) {
                    throw new IllegalStateException(
                            "게시글 이미지 저장 경로가 올바르지 않습니다."
                    );
                }

                savedFilePaths.add(targetPath);

                try (InputStream inputStream =
                             file.getInputStream()) {

                    Files.copy(
                            inputStream,
                            targetPath,
                            StandardCopyOption.REPLACE_EXISTING
                    );
                }

                CommunityPostImage postImage =
                        new CommunityPostImage();

                postImage.setPost(post);
                postImage.setOriginalName(originalName);
                postImage.setStoredName(storedName);
                postImage.setImageUrl(
                        "/uploads/community/" + storedName
                );
                postImage.setContentType(
                        file.getContentType()
                );
                postImage.setFileSize(
                        file.getSize()
                );
                postImage.setDisplayOrder(
                        displayOrder++
                );

                CommunityPostImage savedImage =
                        communityPostImageRepository.saveAndFlush(
                                postImage
                        );

                responses.add(
                        toImageResponse(savedImage)
                );
            }
        } catch (IOException | RuntimeException e) {
            deleteFilesQuietly(savedFilePaths);

            throw new IllegalStateException(
                    "게시글 이미지 저장에 실패했습니다.",
                    e
            );
        }

        return responses;
    }

    // 게시글의 이미지 목록을 표시 순서대로 조회한다.
    public List<CommunityPostImageResponse> getImagesByPostId(
            Long postId
    ) {

        return communityPostImageRepository
                .findByPost_PostIdOrderByDisplayOrderAsc(postId)
                .stream()
                .map(this::toImageResponse)
                .toList();
    }

    // 게시글 작성자가 등록한 이미지 한 장을 삭제한다.
    @Transactional
    public void deleteImage(
            Long postImageId,
            Long currentUserId
    ) {

        CommunityPostImage postImage =
                communityPostImageRepository
                        .findById(postImageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "게시글 이미지를 찾을 수 없습니다."
                                )
                        );

        validatePostWriter(
                postImage.getPost(),
                currentUserId
        );

        deleteStoredImageFile(postImage);

        communityPostImageRepository.delete(postImage);
    }

    // 게시글 삭제 시 연결된 실제 이미지와 DB 정보를 모두 삭제한다.
    // 호출하는 게시글 Service에서 작성자 검증을 먼저 수행한다.
    @Transactional
    public void deleteAllImagesByPostId(
            Long postId
    ) {

        List<CommunityPostImage> postImages =
                communityPostImageRepository
                        .findByPost_PostIdOrderByDisplayOrderAsc(
                                postId
                        );

        for (CommunityPostImage postImage : postImages) {
            deleteStoredImageFile(postImage);
        }

        communityPostImageRepository.deleteAll(postImages);
    }

    // 서버에 저장된 실제 게시글 이미지 파일 한 장을 삭제한다.
    private void deleteStoredImageFile(
            CommunityPostImage postImage
    ) {

        Path uploadPath = Paths.get(communityUploadDir)
                .toAbsolutePath()
                .normalize();

        Path imagePath = uploadPath
                .resolve(postImage.getStoredName())
                .normalize();

        if (!imagePath.startsWith(uploadPath)) {
            throw new IllegalStateException(
                    "게시글 이미지 파일 경로가 올바르지 않습니다."
            );
        }

        try {
            Files.deleteIfExists(imagePath);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "게시글 이미지 파일 삭제에 실패했습니다.",
                    e
            );
        }
    }

    // 다중 업로드 실패 시 이번 요청에서 저장된 실제 파일을 정리한다.
    private void deleteFilesQuietly(
            List<Path> filePaths
    ) {

        for (Path filePath : filePaths) {
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException cleanupError) {
                log.warn(
                        "업로드 실패 후 게시글 이미지 파일을 정리하지 못했습니다: {}",
                        filePath,
                        cleanupError
                );
            }
        }
    }

    // 게시글 번호로 게시글을 조회한다.
    private CommunityPost findPost(
            Long postId
    ) {

        return communityPostRepository
                .findById(postId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "게시글을 찾을 수 없습니다."
                        )
                );
    }

    // 로그인 사용자가 게시글 작성자인지 확인한다.
    private void validatePostWriter(
            CommunityPost post,
            Long currentUserId
    ) {

        if (currentUserId == null) {
            throw new IllegalStateException(
                    "로그인 후 이용할 수 있습니다."
            );
        }

        Long writerId = post
                .getWriter()
                .getUserId();

        if (!writerId.equals(currentUserId)) {
            throw new IllegalStateException(
                    "본인의 게시글에만 이미지를 등록하거나 삭제할 수 있습니다."
            );
        }
    }

    // 이미지 크기, 확장자, MIME 타입과 실제 내용을 확인한다.
    private void validateImageFile(
            MultipartFile file
    ) {

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "이미지 한 장의 크기는 5MB를 초과할 수 없습니다."
            );
        }

        String originalName =
                file.getOriginalFilename();

        String extension =
                extractExtension(originalName);

        boolean jpegExtension =
                ".jpg".equals(extension)
                        || ".jpeg".equals(extension);

        boolean pngExtension =
                ".png".equals(extension);

        if (!jpegExtension && !pngExtension) {
            throw new IllegalArgumentException(
                    "JPG, JPEG, PNG 파일만 업로드할 수 있습니다."
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException(
                    "파일 형식을 확인할 수 없습니다."
            );
        }

        String normalizedContentType =
                contentType.toLowerCase(Locale.ROOT);

        boolean jpegContentType =
                "image/jpeg".equals(normalizedContentType)
                        || "image/jpg".equals(normalizedContentType);

        boolean pngContentType =
                "image/png".equals(normalizedContentType);

        if (jpegExtension && !jpegContentType) {
            throw new IllegalArgumentException(
                    "JPG 파일의 형식이 올바르지 않습니다."
            );
        }

        if (pngExtension && !pngContentType) {
            throw new IllegalArgumentException(
                    "PNG 파일의 형식이 올바르지 않습니다."
            );
        }

        validateFileSignature(
                file,
                extension
        );
    }

    // JPG 또는 PNG 파일의 실제 시작 바이트를 확인한다.
    private void validateFileSignature(
            MultipartFile file,
            String extension
    ) {

        try (InputStream inputStream =
                     file.getInputStream()) {

            byte[] header =
                    inputStream.readNBytes(8);

            boolean validSignature;

            if (".jpg".equals(extension)
                    || ".jpeg".equals(extension)) {

                validSignature =
                        isJpegSignature(header);
            } else {
                validSignature =
                        isPngSignature(header);
            }

            if (!validSignature) {
                throw new IllegalArgumentException(
                        "확장자와 실제 이미지 파일 형식이 일치하지 않습니다."
                );
            }
        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "이미지 파일의 내용을 확인할 수 없습니다.",
                    e
            );
        }
    }

    // JPG 파일은 FF D8 FF 바이트로 시작한다.
    private boolean isJpegSignature(
            byte[] header
    ) {

        return header.length >= 3
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xFF) == 0xD8
                && (header[2] & 0xFF) == 0xFF;
    }

    // PNG 파일의 고정된 시작 바이트를 확인한다.
    private boolean isPngSignature(
            byte[] header
    ) {

        return header.length >= 8
                && (header[0] & 0xFF) == 0x89
                && (header[1] & 0xFF) == 0x50
                && (header[2] & 0xFF) == 0x4E
                && (header[3] & 0xFF) == 0x47
                && (header[4] & 0xFF) == 0x0D
                && (header[5] & 0xFF) == 0x0A
                && (header[6] & 0xFF) == 0x1A
                && (header[7] & 0xFF) == 0x0A;
    }

    // 원본 파일명에서 확장자를 추출하고 소문자로 반환한다.
    private String extractExtension(
            String originalName
    ) {

        if (originalName == null
                || !originalName.contains(".")) {

            return "";
        }

        return originalName
                .substring(
                        originalName.lastIndexOf(".")
                )
                .toLowerCase(Locale.ROOT);
    }

    // 이미지 Entity를 응답 DTO로 변환한다.
    private CommunityPostImageResponse toImageResponse(
            CommunityPostImage postImage
    ) {

        CommunityPostImageResponse response =
                new CommunityPostImageResponse();

        response.setPostImageId(
                postImage.getPostImageId()
        );
        response.setOriginalName(
                postImage.getOriginalName()
        );
        response.setImageUrl(
                postImage.getImageUrl()
        );
        response.setDisplayOrder(
                postImage.getDisplayOrder()
        );

        return response;
    }
}