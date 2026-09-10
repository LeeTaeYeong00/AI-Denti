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

import com.example.denti_back.community.dto.request.CommunityCommentCreateRequest;
import com.example.denti_back.community.dto.request.CommunityCommentUpdateRequest;
import com.example.denti_back.community.dto.response.CommunityCommentListResponse;
import com.example.denti_back.community.dto.response.CommunityCommentResponse;
import com.example.denti_back.community.service.CommunityCommentService;
import com.example.denti_back.member.security.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 자유게시판 댓글 등록, 조회, 수정, 삭제 요청을 처리한다.
@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityCommentController {

    private final CommunityCommentService communityCommentService;

    // 로그인한 사용자가 특정 게시글에 댓글을 등록한다.
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommunityCommentResponse> createComment(
            @PathVariable
            Long postId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid
            @RequestBody
            CommunityCommentCreateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityCommentResponse response =
                communityCommentService.createComment(
                        postId,
                        currentUserId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 특정 게시글의 댓글 목록을 작성 시간순으로 조회한다.
    // 로그인하지 않은 사용자도 조회할 수 있다.
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<CommunityCommentListResponse> getComments(
            @PathVariable
            Long postId,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "20")
            int size
    ) {

        CommunityCommentListResponse response =
                communityCommentService.getComments(
                        postId,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    // 로그인한 댓글 작성자가 자신의 댓글을 수정한다.
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommunityCommentResponse> updateComment(
            @PathVariable
            Long commentId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid
            @RequestBody
            CommunityCommentUpdateRequest request
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        CommunityCommentResponse response =
                communityCommentService.updateComment(
                        commentId,
                        currentUserId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // 로그인한 댓글 작성자가 자신의 댓글을 삭제한다.
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable
            Long commentId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails
    ) {

        Long currentUserId =
                getRequiredUserId(userDetails);

        communityCommentService.deleteComment(
                commentId,
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
}