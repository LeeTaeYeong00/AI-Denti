package com.example.denti_back.community.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.denti_back.community.dto.request.CommunityPostCreateRequest;
import com.example.denti_back.community.dto.request.CommunityPostUpdateRequest;
import com.example.denti_back.community.dto.response.CommunityPostDetailResponse;
import com.example.denti_back.community.dto.response.CommunityPostListResponse;
import com.example.denti_back.community.service.CommunityPostService;
import com.example.denti_back.member.security.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 자유게시판 게시글 등록, 목록, 상세 조회, 수정, 삭제 요청을 처리한다.
@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;

    // 로그인한 사용자가 자유게시판 게시글을 등록한다.
    @PostMapping
    public ResponseEntity<CommunityPostDetailResponse> createPost(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid
            @RequestBody
            CommunityPostCreateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityPostDetailResponse response =
                communityPostService.createPost(
                        currentUserId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 자유게시판 게시글 목록을 최신순으로 조회한다.
    // keyword가 있으면 제목 또는 본문에서 검색한다.
    @GetMapping
    public ResponseEntity<CommunityPostListResponse> getPosts(
            @RequestParam(defaultValue = "")
            String keyword,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "10")
            int size
    ) {

        CommunityPostListResponse response =
                communityPostService.getPosts(
                        keyword,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    // 게시글 상세 정보를 조회하고 조회수를 1 증가시킨다.
    // 비로그인 사용자도 조회할 수 있다.
    @GetMapping("/{postId}")
    public ResponseEntity<CommunityPostDetailResponse> getPost(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getOptionalUserId(userDetails);

        CommunityPostDetailResponse response =
                communityPostService.getPost(
                        postId,
                        currentUserId
                );

        return ResponseEntity.ok(response);
    }

    // 로그인한 게시글 작성자가 자신의 게시글을 수정한다.
    @PutMapping("/{postId}")
    public ResponseEntity<CommunityPostDetailResponse> updatePost(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid
            @RequestBody
            CommunityPostUpdateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityPostDetailResponse response =
                communityPostService.updatePost(
                        postId,
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 로그인한 게시글 작성자가 자신의 게시글을 삭제한다.
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        communityPostService.deletePost(
                postId,
                currentUserId
        );

        return ResponseEntity.noContent().build();
    }

    // 로그인이 필요한 기능에서 현재 사용자 번호를 가져온다.
    private Long getRequiredUserId(
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

    // 공개 조회 기능에서 로그인한 경우에만 사용자 번호를 가져온다.
    private Long getOptionalUserId(
            CustomUserDetails userDetails
    ) {

        if (userDetails == null) {
            return null;
        }

        return userDetails
                .getUser()
                .getUserId();
    }
}