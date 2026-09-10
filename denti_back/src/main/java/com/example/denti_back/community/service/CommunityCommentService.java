package com.example.denti_back.community.service;

import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.community.dto.request.CommunityCommentCreateRequest;
import com.example.denti_back.community.dto.request.CommunityCommentUpdateRequest;
import com.example.denti_back.community.dto.response.CommunityCommentListResponse;
import com.example.denti_back.community.dto.response.CommunityCommentResponse;
import com.example.denti_back.community.entity.CommunityComment;
import com.example.denti_back.community.entity.CommunityPost;
import com.example.denti_back.community.repository.CommunityCommentRepository;
import com.example.denti_back.community.repository.CommunityPostRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityCommentService {

    private static final int MAX_COMMENT_LENGTH = 1000;

    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityPostRepository communityPostRepository;
    private final UserRepository userRepository;
    private final CommunityWriterShopService communityWriterShopService;

    // 로그인한 사용자가 게시글에 댓글을 등록한다.
    @Transactional
    public CommunityCommentResponse createComment(
            Long postId,
            Long currentUserId,
            CommunityCommentCreateRequest request
    ) {

        validateCurrentUser(currentUserId);

        String content = normalizeContent(
                request == null ? null : request.getContent()
        );

        CommunityPost post = findPost(postId);
        User writer = findUser(currentUserId);

        CommunityComment comment =
                new CommunityComment();

        comment.setPost(post);
        comment.setWriter(writer);
        comment.setContent(content);

        CommunityComment savedComment =
                communityCommentRepository.save(comment);

        return toCommentResponse(savedComment);
    }

    // 특정 게시글의 댓글을 작성 시간순으로 조회한다.
    public CommunityCommentListResponse getComments(
            Long postId,
            int page,
            int size
    ) {

        findPost(postId);
        validatePageRequest(page, size);

        Pageable pageable =
                PageRequest.of(page, size);

        Page<CommunityComment> commentPage =
                communityCommentRepository
                        .findByPost_PostIdOrderByCreatedAtAsc(
                                postId,
                                pageable
                        );

        List<CommunityCommentResponse> comments =
                commentPage
                        .getContent()
                        .stream()
                        .map(this::toCommentResponse)
                        .toList();

        CommunityCommentListResponse response =
                new CommunityCommentListResponse();

        response.setPostId(postId);
        response.setCommentCount(
                commentPage.getTotalElements()
        );
        response.setComments(comments);
        response.setCurrentPage(
                commentPage.getNumber()
        );
        response.setTotalPages(
                commentPage.getTotalPages()
        );

        return response;
    }

    // 댓글 작성자가 자신의 댓글을 수정한다.
    @Transactional
    public CommunityCommentResponse updateComment(
            Long commentId,
            Long currentUserId,
            CommunityCommentUpdateRequest request
    ) {

        validateCurrentUser(currentUserId);

        String content = normalizeContent(
                request == null ? null : request.getContent()
        );

        CommunityComment comment =
                findComment(commentId);

        validateCommentWriter(
                comment,
                currentUserId
        );

        comment.setContent(content);

        CommunityComment updatedComment =
                communityCommentRepository.save(comment);

        return toCommentResponse(updatedComment);
    }

    // 댓글 작성자가 자신의 댓글을 삭제한다.
    @Transactional
    public void deleteComment(
            Long commentId,
            Long currentUserId
    ) {

        validateCurrentUser(currentUserId);

        CommunityComment comment =
                findComment(commentId);

        validateCommentWriter(
                comment,
                currentUserId
        );

        communityCommentRepository.delete(comment);
    }

    // 게시글 삭제 시 해당 게시글의 댓글을 모두 삭제한다.
    @Transactional
    public void deleteAllCommentsByPostId(
            Long postId
    ) {

        communityCommentRepository
                .deleteByPost_PostId(postId);
    }

    // 댓글 번호로 댓글을 조회한다.
    private CommunityComment findComment(
            Long commentId
    ) {

        return communityCommentRepository
                .findById(commentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "댓글을 찾을 수 없습니다."
                        )
                );
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

    // 회원 번호로 댓글 작성자를 조회한다.
    private User findUser(
            Long userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자 정보를 찾을 수 없습니다."
                        )
                );
    }

    // 로그인이 필요한 기능에서 사용자 번호가 존재하는지 확인한다.
    private void validateCurrentUser(
            Long currentUserId
    ) {

        if (currentUserId == null) {
            throw new IllegalStateException(
                    "로그인 후 이용할 수 있습니다."
            );
        }
    }

    // 로그인 사용자가 해당 댓글의 작성자인지 확인한다.
    private void validateCommentWriter(
            CommunityComment comment,
            Long currentUserId
    ) {

        Long writerId = comment
                .getWriter()
                .getUserId();

        if (!Objects.equals(writerId, currentUserId)) {
            throw new IllegalStateException(
                    "본인의 댓글만 수정하거나 삭제할 수 있습니다."
            );
        }
    }

    // 댓글 내용을 정리하고 길이를 확인한다.
    private String normalizeContent(
            String content
    ) {

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "댓글 내용을 입력해야 합니다."
            );
        }

        String normalizedContent = content.trim();

        if (normalizedContent.length() > MAX_COMMENT_LENGTH) {
            throw new IllegalArgumentException(
                    "댓글은 1000자 이하로 작성해야 합니다."
            );
        }

        return normalizedContent;
    }

    // 페이지 번호와 한 페이지의 댓글 개수를 확인한다.
    private void validatePageRequest(
            int page,
            int size
    ) {

        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException(
                    "페이지 번호와 크기가 올바르지 않습니다."
            );
        }
    }

    // 댓글 Entity를 응답 DTO로 변환한다.
    private CommunityCommentResponse toCommentResponse(
            CommunityComment comment
    ) {

        User writer = comment.getWriter();

        CommunityCommentResponse response =
                new CommunityCommentResponse();

        response.setCommentId(
                comment.getCommentId()
        );
        response.setPostId(
                comment.getPost().getPostId()
        );
        response.setWriterId(
                writer.getUserId()
        );
        response.setWriterNickname(
                writer.getNickName()
        );
        response.setWriterShops(
                communityWriterShopService
                        .getApprovedWriterShops(
                                writer.getUserId()
                        )
        );
        response.setContent(
                comment.getContent()
        );
        response.setCreatedAt(
                comment.getCreatedAt()
        );
        response.setUpdatedAt(
                comment.getUpdatedAt()
        );

        return response;
    }
}