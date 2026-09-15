package com.example.denti_back.inquiry.entity;

import com.example.denti_back.community.entity.CommunityPost;
import com.example.denti_back.inquiry.enums.InquiryStatus;
import com.example.denti_back.inquiry.enums.InquiryType;
import com.example.denti_back.member.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inquiryId;

    @Enumerated(EnumType.STRING)
    private InquiryType type;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    private String guestEmail;

    private String title;

    @Column(length = 2000)
    private String content;

    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @ManyToOne
    @JoinColumn(name = "reported_post_id")
    private CommunityPost reportedPost;

    @Enumerated(EnumType.STRING)
    private InquiryStatus status;

    @Column(length = 2000)
    private String answer;

    private LocalDateTime answeredAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = InquiryStatus.PENDING;
        }
    }
}