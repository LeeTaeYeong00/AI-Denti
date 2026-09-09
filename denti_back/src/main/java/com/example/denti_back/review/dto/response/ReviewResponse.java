package com.example.denti_back.review.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 리뷰 한 건의 전체 정보를 프론트에 전달하는 응답 DTO이다.
@Getter
@Setter
public class ReviewResponse {

    // 리뷰의 기본키이다.
    private Long reviewId;

    // 리뷰가 작성된 예약 번호이다.
    private Long reservationId;

    // 리뷰가 작성된 정비소 번호와 이름이다.
    private Long shopId;
    private String shopName;

    // 리뷰 작성자의 번호와 닉네임이다.
    private Long writerId;
    private String writerNickname;

    // 사용자가 작성한 별점과 리뷰 본문이다.
    private Integer rating;
    private String content;

    // 리뷰에 첨부된 이미지 목록이다.
    private List<ReviewImageResponse> images;

    // 정비소가 작성한 공식 답변이다.
    // 아직 답변이 없다면 null이다.
    private ReviewReplyResponse reply;

    // 리뷰가 받은 전체 좋아요 개수이다.
    private long likeCount;

    // 현재 로그인한 사용자가 이 리뷰에 좋아요를 눌렀는지 나타낸다.
    private boolean liked;

    // 리뷰 작성 시간과 마지막 수정 시간이다.
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}