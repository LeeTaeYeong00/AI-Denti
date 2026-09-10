package com.example.denti_back.community.service;

import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.community.dto.request.CommunityPostCreateRequest;
import com.example.denti_back.community.dto.request.CommunityPostUpdateRequest;
import com.example.denti_back.community.dto.response.CommunityPostDetailResponse;
import com.example.denti_back.community.dto.response.CommunityPostListResponse;
import com.example.denti_back.community.dto.response.CommunityPostSummaryResponse;
import com.example.denti_back.community.entity.CommunityPost;
import com.example.denti_back.community.entity.CommunityPostImage;
import com.example.denti_back.community.repository.CommunityCommentRepository;
import com.example.denti_back.community.repository.CommunityPostImageRepository;
import com.example.denti_back.community.repository.CommunityPostLikeRepository;
import com.example.denti_back.community.repository.CommunityPostRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityPostService {

    private static final int MAX_TITLE_LENGTH = 150;
    private static final int MAX_CONTENT_LENGTH = 10000;

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostImageRepository communityPostImageRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final UserRepository userRepository;
    private final CommunityPostImageService communityPostImageService;
    private final CommunityWriterShopService communityWriterShopService;

    // 로그인한 사용자가 자유게시판 게시글을 등록한다.
    @Transactional
    public CommunityPostDetailResponse createPost(
            Long currentUserId,
            CommunityPostCreateRequest request
    ) {

        validateCurrentUser(currentUserId);

        String title = normalizeTitle(
                request == null ? null : request.getTitle()
        );
        String content = normalizeContent(
                request == null ? null : request.getContent()
        );

        User writer = findUser(currentUserId);

        CommunityPost post = new CommunityPost();

        post.setWriter(writer);
        post.setTitle(title);
        post.setContent(content);

        CommunityPost savedPost =
                communityPostRepository.saveAndFlush(post);

        return toDetailResponse(
                savedPost,
                currentUserId
        );
    }

    // 최신순으로 게시글 목록을 조회하며 제목 또는 본문 검색을 지원한다.
    public CommunityPostListResponse getPosts(
            String keyword,
            int page,
            int size
    ) {

        validatePageRequest(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

        String normalizedKeyword =
                keyword == null ? "" : keyword.trim();

        Page<CommunityPost> postPage;

        if (normalizedKeyword.isBlank()) {
            postPage = communityPostRepository
                    .findAll(pageable);
        } else {
            postPage = communityPostRepository
                    .findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                            normalizedKeyword,
                            normalizedKeyword,
                            pageable
                    );
        }

        List<CommunityPostSummaryResponse> posts =
                postPage
                        .getContent()
                        .stream()
                        .map(this::toSummaryResponse)
                        .toList();

        CommunityPostListResponse response =
                new CommunityPostListResponse();

        response.setPosts(posts);
        response.setCurrentPage(
                postPage.getNumber()
        );
        response.setTotalPages(
                postPage.getTotalPages()
        );
        response.setTotalElements(
                postPage.getTotalElements()
        );

        return response;
    }

    // 게시글 한 건을 조회하고 조회수를 1 증가시킨다.
    @Transactional
    public CommunityPostDetailResponse getPost(
            Long postId,
            Long currentUserId
    ) {

        int updatedRows =
                communityPostRepository
                        .increaseViewCount(postId);

        if (updatedRows == 0) {
            throw new IllegalArgumentException(
                    "게시글을 찾을 수 없습니다."
            );
        }

        CommunityPost post = findPost(postId);

        return toDetailResponse(
                post,
                currentUserId
        );
    }

    // 게시글 작성자가 자신의 게시글을 수정한다.
    @Transactional
    public CommunityPostDetailResponse updatePost(
            Long postId,
            Long currentUserId,
            CommunityPostUpdateRequest request
    ) {

        validateCurrentUser(currentUserId);

        String title = normalizeTitle(
                request == null ? null : request.getTitle()
        );
        String content = normalizeContent(
                request == null ? null : request.getContent()
        );

        CommunityPost post = findPost(postId);

        validatePostWriter(
                post,
                currentUserId
        );

        post.setTitle(title);
        post.setContent(content);

        CommunityPost updatedPost =
                communityPostRepository.saveAndFlush(post);

        return toDetailResponse(
                updatedPost,
                currentUserId
        );
    }

    // 게시글 작성자가 자신의 게시글과 연결된 데이터를 삭제한다.
    @Transactional
    public void deletePost(
            Long postId,
            Long currentUserId
    ) {

        validateCurrentUser(currentUserId);

        CommunityPost post = findPost(postId);

        validatePostWriter(
                post,
                currentUserId
        );

        communityPostLikeRepository
                .deleteByPost_PostId(postId);

        communityCommentRepository
                .deleteByPost_PostId(postId);

        communityPostImageService
                .deleteAllImagesByPostId(postId);

        communityPostRepository.delete(post);
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

    // 회원 번호로 게시글 작성자를 조회한다.
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

    // 로그인 사용자가 해당 게시글의 작성자인지 확인한다.
    private void validatePostWriter(
            CommunityPost post,
            Long currentUserId
    ) {

        Long writerId = post
                .getWriter()
                .getUserId();

        if (!Objects.equals(writerId, currentUserId)) {
            throw new IllegalStateException(
                    "본인의 게시글만 수정하거나 삭제할 수 있습니다."
            );
        }
    }

    // 게시글 제목을 정리하고 길이를 확인한다.
    private String normalizeTitle(
            String title
    ) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "게시글 제목을 입력해야 합니다."
            );
        }

        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException(
                    "게시글 제목은 150자 이하로 작성해야 합니다."
            );
        }

        return title.trim();
    }

    // 게시글 본문을 정리하고 길이를 확인한다.
    private String normalizeContent(
            String content
    ) {

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "게시글 내용을 입력해야 합니다."
            );
        }

        if (content.length() > MAX_CONTENT_LENGTH) {
            throw new IllegalArgumentException(
                    "게시글 내용은 10000자 이하로 작성해야 합니다."
            );
        }

        return content.trim();
    }

    // 페이지 번호와 한 페이지의 게시글 개수를 확인한다.
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

    // 게시글 Entity를 목록용 응답 DTO로 변환한다.
    private CommunityPostSummaryResponse toSummaryResponse(
            CommunityPost post
    ) {

        User writer = post.getWriter();
        Long postId = post.getPostId();

        CommunityPostSummaryResponse response =
                new CommunityPostSummaryResponse();

        response.setPostId(postId);
        response.setTitle(
                post.getTitle()
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
        response.setViewCount(
                post.getViewCount()
        );
        response.setLikeCount(
                communityPostLikeRepository
                        .countByPost_PostId(postId)
        );
        response.setCommentCount(
                communityCommentRepository
                        .countByPost_PostId(postId)
        );
        response.setThumbnailUrl(
                getThumbnailUrl(postId)
        );
        response.setCreatedAt(
                post.getCreatedAt()
        );

        return response;
    }

    // 게시글 Entity를 상세 응답 DTO로 변환한다.
    private CommunityPostDetailResponse toDetailResponse(
            CommunityPost post,
            Long currentUserId
    ) {

        User writer = post.getWriter();
        Long postId = post.getPostId();

        boolean liked = currentUserId != null
                && communityPostLikeRepository
                        .existsByPost_PostIdAndUser_UserId(
                                postId,
                                currentUserId
                        );

        CommunityPostDetailResponse response =
                new CommunityPostDetailResponse();

        response.setPostId(postId);
        response.setTitle(
                post.getTitle()
        );
        response.setContent(
                post.getContent()
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
        response.setImages(
                communityPostImageService
                        .getImagesByPostId(postId)
        );
        response.setViewCount(
                post.getViewCount()
        );
        response.setLikeCount(
                communityPostLikeRepository
                        .countByPost_PostId(postId)
        );
        response.setLiked(liked);
        response.setCommentCount(
                communityCommentRepository
                        .countByPost_PostId(postId)
        );
        response.setCreatedAt(
                post.getCreatedAt()
        );
        response.setUpdatedAt(
                post.getUpdatedAt()
        );

        return response;
    }

    // 게시글에 첨부된 첫 번째 이미지 주소를 반환한다.
    private String getThumbnailUrl(
            Long postId
    ) {

        List<CommunityPostImage> images =
                communityPostImageRepository
                        .findByPost_PostIdOrderByDisplayOrderAsc(
                                postId
                        );

        if (images.isEmpty()) {
            return null;
        }

        return images.get(0).getImageUrl();
    }
}