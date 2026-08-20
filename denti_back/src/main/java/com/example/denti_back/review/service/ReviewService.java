package com.example.denti_back.review.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.denti_back.reservation.entity.Reservation;
import com.example.denti_back.reservation.enums.ReservationStatus;
import com.example.denti_back.reservation.repository.ReservationRepository;
import com.example.denti_back.review.dto.request.ReviewCreateRequest;
import com.example.denti_back.review.dto.request.ReviewUpdateRequest;
import com.example.denti_back.review.dto.response.MyReviewResponse;
import com.example.denti_back.review.dto.response.ReviewImageResponse;
import com.example.denti_back.review.dto.response.ReviewReplyResponse;
import com.example.denti_back.review.dto.response.ReviewResponse;
import com.example.denti_back.review.dto.response.ShopReviewResponse;
import com.example.denti_back.review.entity.Review;
import com.example.denti_back.review.entity.ReviewImage;
import com.example.denti_back.review.entity.ReviewReply;
import com.example.denti_back.review.repository.ReviewImageRepository;
import com.example.denti_back.review.repository.ReviewLikeRepository;
import com.example.denti_back.review.repository.ReviewReplyRepository;
import com.example.denti_back.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewLikeRepository reviewLikeRepository;

    // 리뷰를 등록한다.
    @Transactional
    public ReviewResponse createReview(
            Long currentUserId,
            ReviewCreateRequest request) {

        validateReviewInput(
                request.getRating(),
                request.getContent()
        );

        Reservation reservation = reservationRepository
                .findById(request.getReservationId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "예약을 찾을 수 없습니다."
                        )
                );

        // 로그인 사용자 본인의 예약인지 확인한다.
        if (!reservation
                .getUser()
                .getUserId()
                .equals(currentUserId)) {

            throw new IllegalStateException(
                    "본인의 예약에만 리뷰를 작성할 수 있습니다."
            );
        }

        // 정비가 완료된 예약에만 리뷰를 작성할 수 있다.
        if (reservation.getStatus()
                != ReservationStatus.COMPLETED) {

            throw new IllegalStateException(
                    "정비가 완료된 예약에만 리뷰를 작성할 수 있습니다."
            );
        }

        // 동일한 예약에 리뷰가 이미 존재하는지 확인한다.
        if (reviewRepository
                .existsByReservation_ReservationId(
                        reservation.getReservationId()
                )) {

            throw new IllegalStateException(
                    "해당 예약에는 이미 리뷰가 작성되어 있습니다."
            );
        }

        Review review = new Review();

        review.setReservation(reservation);
        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());

        Review savedReview = reviewRepository.save(review);

        return toReviewResponse(savedReview, currentUserId);
    }

    // 리뷰 번호를 기준으로 리뷰 한 건을 조회한다.
    public ReviewResponse getReview(
            Long reviewId,
            Long currentUserId) {

        Review review = findReview(reviewId);

        return toReviewResponse(review, currentUserId);
    }

    // 정비소별 리뷰 목록과 평균 별점을 조회한다.
    public ShopReviewResponse getShopReviews(
            Long shopId,
            int page,
            int size,
            Long currentUserId) {

        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException(
                    "페이지 번호와 크기가 올바르지 않습니다."
            );
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

        Page<Review> reviewPage =
                reviewRepository
                        .findByReservation_Shop_ShopId(
                                shopId,
                                pageable
                        );

        List<ReviewResponse> reviews = reviewPage
                .getContent()
                .stream()
                .map(review ->
                        toReviewResponse(
                                review,
                                currentUserId
                        )
                )
                .toList();

        ShopReviewResponse response =
                new ShopReviewResponse();

        response.setShopId(shopId);

        response.setAverageRating(
                reviewRepository
                        .findAverageRatingByShopId(shopId)
        );

        response.setReviewCount(
                reviewRepository
                        .countByReservation_Shop_ShopId(
                                shopId
                        )
        );

        response.setReviews(reviews);
        response.setCurrentPage(reviewPage.getNumber());
        response.setTotalPages(reviewPage.getTotalPages());

        return response;
    }

    // 현재 로그인한 사용자가 작성한 리뷰 목록을 조회한다.
    public MyReviewResponse getMyReviews(
            Long currentUserId,
            int page,
            int size) {

        if (currentUserId == null) {
            throw new IllegalArgumentException(
                    "로그인 사용자 정보가 필요합니다."
            );
        }

        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException(
                    "페이지 번호와 크기가 올바르지 않습니다."
            );
        }

        Pageable pageable = PageRequest.of(
                page,
                size
        );

        // 리뷰에 연결된 예약의 사용자 번호를 기준으로 조회한다.
        Page<Review> reviewPage =
                reviewRepository
                        .findByReservation_User_UserIdOrderByCreatedAtDesc(
                                currentUserId,
                                pageable
                        );

        List<ReviewResponse> reviews = reviewPage
                .getContent()
                .stream()
                .map(review ->
                        toReviewResponse(
                                review,
                                currentUserId
                        )
                )
                .toList();

        MyReviewResponse response =
                new MyReviewResponse();

        response.setUserId(currentUserId);
        response.setReviewCount(
                reviewPage.getTotalElements()
        );
        response.setReviews(reviews);
        response.setCurrentPage(
                reviewPage.getNumber()
        );
        response.setTotalPages(
                reviewPage.getTotalPages()
        );

        return response;
    }

    // 작성자가 자신의 리뷰를 수정한다.
    @Transactional
    public ReviewResponse updateReview(
            Long reviewId,
            Long currentUserId,
            ReviewUpdateRequest request) {

        validateReviewInput(
                request.getRating(),
                request.getContent()
        );

        Review review = findReview(reviewId);

        validateReviewWriter(
                review,
                currentUserId
        );

        review.setRating(request.getRating());
        review.setContent(
                request.getContent().trim()
        );

        Review updatedReview =
                reviewRepository.save(review);

        return toReviewResponse(
                updatedReview,
                currentUserId
        );
    }

    // 작성자가 자신의 리뷰를 삭제한다.
    @Transactional
    public void deleteReview(
            Long reviewId,
            Long currentUserId) {

        Review review = findReview(reviewId);

        validateReviewWriter(
                review,
                currentUserId
        );

        // 외래키로 연결된 데이터를 먼저 삭제한다.
        reviewImageRepository
                .deleteByReview_ReviewId(reviewId);

        reviewReplyRepository
                .deleteByReview_ReviewId(reviewId);

        reviewLikeRepository
                .deleteByReview_ReviewId(reviewId);

        reviewRepository.delete(review);
    }

    // 리뷰 존재 여부를 확인하고 없으면 예외를 발생시킨다.
    private Review findReview(Long reviewId) {
        return reviewRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "리뷰를 찾을 수 없습니다."
                        )
                );
    }

    // 로그인 사용자가 리뷰 작성자인지 확인한다.
    private void validateReviewWriter(
            Review review,
            Long currentUserId) {

        Long writerId = review
                .getReservation()
                .getUser()
                .getUserId();

        if (!writerId.equals(currentUserId)) {
            throw new IllegalStateException(
                    "본인이 작성한 리뷰만 수정하거나 삭제할 수 있습니다."
            );
        }
    }

    // 별점과 리뷰 내용을 검증한다.
    private void validateReviewInput(
            Integer rating,
            String content) {

        if (rating == null
                || rating < 1
                || rating > 5) {

            throw new IllegalArgumentException(
                    "별점은 1점부터 5점 사이여야 합니다."
            );
        }

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "리뷰 내용을 입력해야 합니다."
            );
        }
    }

    // Review 엔티티를 화면에 전달할 ReviewResponse로 변환한다.
    private ReviewResponse toReviewResponse(
            Review review,
            Long currentUserId) {

        ReviewResponse response =
                new ReviewResponse();

        Reservation reservation =
                review.getReservation();

        response.setReviewId(
                review.getReviewId()
        );

        response.setReservationId(
                reservation.getReservationId()
        );

        response.setShopId(
                reservation
                        .getShop()
                        .getShopId()
        );

        response.setShopName(
                reservation
                        .getShop()
                        .getName()
        );

        response.setWriterId(
                reservation
                        .getUser()
                        .getUserId()
        );

        response.setWriterNickname(
                reservation
                        .getUser()
                        .getNickName()
        );

        response.setRating(
                review.getRating()
        );

        response.setContent(
                review.getContent()
        );

        List<ReviewImageResponse> images =
                reviewImageRepository
                        .findByReview_ReviewIdOrderByDisplayOrderAsc(
                                review.getReviewId()
                        )
                        .stream()
                        .map(this::toImageResponse)
                        .toList();

        response.setImages(images);

        ReviewReplyResponse replyResponse =
                reviewReplyRepository
                        .findByReview_ReviewId(
                                review.getReviewId()
                        )
                        .map(this::toReplyResponse)
                        .orElse(null);

        response.setReply(replyResponse);

        response.setLikeCount(
                reviewLikeRepository
                        .countByReview_ReviewId(
                                review.getReviewId()
                        )
        );

        boolean liked = currentUserId != null
                && reviewLikeRepository
                        .existsByReview_ReviewIdAndUser_UserId(
                                review.getReviewId(),
                                currentUserId
                        );

        response.setLiked(liked);

        response.setCreatedAt(
                review.getCreatedAt()
        );

        response.setUpdatedAt(
                review.getUpdatedAt()
        );

        return response;
    }

    // ReviewImage 엔티티를 응답 DTO로 변환한다.
    private ReviewImageResponse toImageResponse(
            ReviewImage image) {

        ReviewImageResponse response =
                new ReviewImageResponse();

        response.setReviewImageId(
                image.getReviewImageId()
        );

        response.setOriginalName(
                image.getOriginalName()
        );

        response.setImageUrl(
                image.getImageUrl()
        );

        response.setDisplayOrder(
                image.getDisplayOrder()
        );

        return response;
    }

    // ReviewReply 엔티티를 응답 DTO로 변환한다.
    private ReviewReplyResponse toReplyResponse(
            ReviewReply reply) {

        ReviewReplyResponse response =
                new ReviewReplyResponse();

        response.setReplyId(
                reply.getReplyId()
        );

        response.setContent(
                reply.getContent()
        );

        response.setCreatedAt(
                reply.getCreatedAt()
        );

        response.setUpdatedAt(
                reply.getUpdatedAt()
        );

        return response;
    }
}