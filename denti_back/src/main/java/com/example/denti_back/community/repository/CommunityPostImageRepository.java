package com.example.denti_back.community.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.community.entity.CommunityPostImage;

public interface CommunityPostImageRepository
        extends JpaRepository<CommunityPostImage, Long> {

    // 특정 게시글의 이미지를 표시 순서대로 조회한다.
    List<CommunityPostImage>
    findByPost_PostIdOrderByDisplayOrderAsc(
            Long postId
    );

    // 특정 게시글에 현재 등록된 이미지 개수를 조회한다.
    long countByPost_PostId(
            Long postId
    );

    // 기존 이미지 중 가장 큰 표시 순서를 조회한다.
    // 이미지가 없으면 0을 반환한다.
    @Query("""
            SELECT COALESCE(MAX(image.displayOrder), 0)
            FROM CommunityPostImage image
            WHERE image.post.postId = :postId
            """)
    Integer findMaxDisplayOrderByPostId(
            @Param("postId")
            Long postId
    );
}