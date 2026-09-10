package com.example.denti_back.community.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.community.entity.CommunityPostLike;

public interface CommunityPostLikeRepository
        extends JpaRepository<CommunityPostLike, Long> {

    // 현재 사용자가 해당 게시글에 좋아요를 눌렀는지 확인한다.
    boolean existsByPost_PostIdAndUser_UserId(
            Long postId,
            Long userId
    );

    // 특정 게시글의 전체 좋아요 개수를 조회한다.
    long countByPost_PostId(
            Long postId
    );

    // 좋아요가 존재하지 않을 때만 새로 등록한다.
    // 이미 존재하면 오류 없이 현재 상태를 유지한다.
    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query(
            value = """
                    INSERT IGNORE INTO community_post_like
                        (post_id, user_id, created_at)
                    VALUES
                        (:postId, :userId, CURRENT_TIMESTAMP)
                    """,
            nativeQuery = true
    )
    int insertLikeIfAbsent(
            @Param("postId")
            Long postId,
            @Param("userId")
            Long userId
    );

    // 현재 사용자의 게시글 좋아요를 삭제한다.
    // 이미 삭제된 상태여도 오류가 발생하지 않는다.
    long deleteByPost_PostIdAndUser_UserId(
            Long postId,
            Long userId
    );

    // 게시글 삭제 시 해당 게시글의 좋아요를 모두 삭제한다.
    void deleteByPost_PostId(
            Long postId
    );
}