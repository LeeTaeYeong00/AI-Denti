package com.example.denti_back.community.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.community.entity.CommunityComment;

public interface CommunityCommentRepository
        extends JpaRepository<CommunityComment, Long> {

    // 특정 게시글의 댓글을 작성 시간순으로 조회한다.
    Page<CommunityComment>
    findByPost_PostIdOrderByCreatedAtAsc(
            Long postId,
            Pageable pageable
    );

    // 특정 게시글에 작성된 전체 댓글 개수를 조회한다.
    long countByPost_PostId(
            Long postId
    );

    // 게시글 삭제 시 해당 게시글의 댓글을 모두 삭제한다.
    long deleteByPost_PostId(
            Long postId
    );
}