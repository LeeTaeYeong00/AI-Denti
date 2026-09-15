package com.example.denti_back.community.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.denti_back.community.dto.response.CommunityPostImageResponse;
import com.example.denti_back.community.service.CommunityPostImageService;
import com.example.denti_back.member.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

// 자유게시판 게시글 이미지 등록과 삭제 요청을 처리한다.
@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityPostImageController {

    private final CommunityPostImageService communityPostImageService;

    // 현재 로그인한 게시글 작성자가 본인의 게시글에 이미지를 추가한다.
    @PostMapping(
            value = "/posts/{postId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<CommunityPostImageResponse>> uploadImages(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestPart("files")
            List<MultipartFile> files
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        List<CommunityPostImageResponse> responses =
                communityPostImageService.uploadImages(
                        postId,
                        currentUserId,
                        files
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(responses);
    }

    // 현재 로그인한 게시글 작성자가 등록한 이미지 한 장을 삭제한다.
    @DeleteMapping("/images/{postImageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable
            Long postImageId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getCurrentUserId(userDetails);

        communityPostImageService.deleteImage(
                postImageId,
                currentUserId
        );

        return ResponseEntity.noContent().build();
    }

    // 로그인 세션에서 현재 사용자의 번호를 가져온다.
    private Long getCurrentUserId(
            CustomUserDetails userDetails
    ) {

        if (userDetails == null) {
            throw new IllegalStateException(
                    "로그인 후 이용할 수 있습니다."
            );
        }

        return userDetails
                .getUser()
                .getUserId();
    }
}