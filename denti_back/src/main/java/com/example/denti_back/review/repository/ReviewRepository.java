package com.example.denti_back.review.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.denti_back.review.entity.Review;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    // 해당 예약에 이미 작성된 리뷰가 있는지 확인한다.
    boolean existsByReservation_ReservationId(Long reservationId);

    // 예약 번호를 기준으로 작성된 리뷰를 조회한다.
    Optional<Review> findByReservation_ReservationId(Long reservationId);

    // 정비소 번호를 기준으로 리뷰 목록을 페이지 단위로 조회한다.
    Page<Review> findByReservation_Shop_ShopId(
            Long shopId,
            Pageable pageable
    );

    // 특정 사용자가 작성한 리뷰를 최신순으로 페이지 단위 조회한다.
    // Review → Reservation → User 관계를 따라 사용자 번호로 검색한다.
    Page<Review> findByReservation_User_UserIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    // 해당 정비소에 작성된 전체 리뷰 개수를 조회한다.
    long countByReservation_Shop_ShopId(Long shopId);

    // 해당 정비소에 작성된 리뷰들의 평균 별점을 계산한다.
    // 리뷰가 하나도 없으면 null 대신 0.0을 반환한다.
    @Query("""
            SELECT COALESCE(AVG(r.rating), 0.0)
            FROM Review r
            WHERE r.reservation.shop.shopId = :shopId
            """)
    Double findAverageRatingByShopId(
            @Param("shopId") Long shopId
    );
}