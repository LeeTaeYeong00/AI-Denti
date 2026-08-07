package com.example.denti_back.review.entity;

import com.example.denti_back.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    private Integer rating;
}