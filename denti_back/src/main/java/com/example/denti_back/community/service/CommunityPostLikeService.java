package com.example.denti_back.community.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.community.dto.response.CommunityPostLikeResponse;
import com.example.denti_back.community.repository.CommunityPostLikeRepository;
import com.example.denti_back.community.repository.CommunityPostRepository;
import com.example.denti_back.member.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityPostLikeService {

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final UserRepository userRepository;

    // 게시글을 좋아요 상태로 만든다.
    // 이미 좋아요 상태라면 추가로 저장lje 않고 현재 상태를 반환한다.
    @Transactional
    public CommunityPostLikeResponse addLike(
            Long postId,
            Long currentUserId
    ) {

        validateCurrentUser(currentUserId);
        validatePost(postId);

        communityPostLikeRepository.insertLikeIfAbsent(
                postId,
                currentUserId
        );

        long likeCount =
                communityPostLikeRepository
                        .countByPost_PostId(postId);

        return createLikeResponse(
                postId,
                likeCount,
                true
        );
    }

    // 게시글 좋아요를 취소한다.
    // 이미 취소된 상태라도 오류 없이 현재 상태를 반환한다.
    @Transactional
    public CommunityPostLikeResponse removeLike(
            Long postId,
            Long currentUserId
    ) {

        validateCurrentUser(currentUserId);
        validatePost(postId);

        communityPostLikeRepository
                .deleteByPost_PostIdAndUser_UserId(
                        postId,
                        currentUserId
                );

        long likeCount =
                communityPostLikeRepository
                        .countByPost_PostId(postId);

        return createLikeResponse(
                postId,
                likeCount,
                false
        );
    }

    // 게시글의 전체 좋아요 수와 현재 사용자의 좋아요 여부를 조회한다.
    public CommunityPostLikeResponse getLikeStatus(
            Long postId,
            Long currentUserId
    ) {

        validatePost(postId);

        boolean liked =
                currentUserId != null
                        && communityPostLikeRepository
                                .existsByPost_PostIdAndUser_UserId(
                                        postId,
                                        currentUserId
                                );

        long likeCount =
                communityPostLikeRepository
                        .countByPost_PostId(postId);

        return createLikeResponse(
                postId,
                likeCount,
                liked
        );
    }

    // 로그인 사용자 정보와 실제 사용자 존재 여부를 확인한다.
    private void validateCurrentUser(
            Long currentUserId
    ) {

        if (currentUserId == null) {
            throw new IllegalStateException(
                    "로그인 후 좋아요를 이용할 수 있습니다."
            );
        }

        if (!userRepository.existsById(currentUserId)) {
            throw new IllegalArgumentException(
                    "사용자를 찾을 수 없습니다."
            );
        }
    }

    // 게시글 존재 여부를 확인한다.
    private void validatePost(
            Long postId
    ) {

        if (!communityPostRepository.existsById(postId)) {
            throw new IllegalArgumentException(
                    "게시글을 찾을 수 없습니다."
            );
        }
    }

    // 좋아요 처리 결과를 응답 DTO로 변환한다.
    private CommunityPostLikeResponse createLikeResponse(
            Long postId,
            long likeCount,
            boolean liked
    ) {

        CommunityPostLikeResponse response =
                new CommunityPostLikeResponse();

        response.setPostId(postId);
        response.setLikeCount(likeCount);
        response.setLiked(liked);

        return response;
    }
}