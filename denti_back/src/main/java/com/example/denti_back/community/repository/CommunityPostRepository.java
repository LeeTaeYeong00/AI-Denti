package com.example.denti_back.community.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.community.entity.CommunityPost;

public interface CommunityPostRepository
        extends JpaRepository<CommunityPost, Long> {

    // 제목 또는 본문에 검색어가 포함된 게시글을 페이지 단위로 조회한다.
    Page<CommunityPost>
    findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String titleKeyword,
            String contentKeyword,
            Pageable pageable
    );

    // 게시글 조회수를 데이터베이스에서 1 증가시킨다.
    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query("""
            UPDATE CommunityPost post
            SET post.viewCount = post.viewCount + 1
            WHERE post.postId = :postId
            """)
    int increaseViewCount(
            @Param("postId")
            Long postId
    );
}