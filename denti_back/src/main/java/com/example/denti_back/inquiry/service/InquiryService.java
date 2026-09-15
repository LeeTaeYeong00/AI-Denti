package com.example.denti_back.inquiry.service;

import com.example.denti_back.community.entity.CommunityPost;
import com.example.denti_back.community.repository.CommunityPostRepository;
import com.example.denti_back.inquiry.dto.InquiryCreateRequestDto;
import com.example.denti_back.inquiry.dto.InquiryResponseDto;
import com.example.denti_back.inquiry.entity.Inquiry;
import com.example.denti_back.inquiry.enums.InquiryStatus;
import com.example.denti_back.inquiry.enums.InquiryType;
import com.example.denti_back.inquiry.repository.InquiryRepository;
import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final CommunityPostRepository communityPostRepository;

    @Transactional
    public InquiryResponseDto createInquiry(User loginUser, InquiryCreateRequestDto request) {

        // 비로그인 유저는 USER_REPORT 작성 불가
        if (loginUser == null && request.getType() == InquiryType.USER_REPORT) {
            throw new IllegalArgumentException("유저 신고는 로그인 후 이용할 수 있습니다.");
        }

        // 비로그인 유저는 답변받을 이메일 필수
        if (loginUser == null && (request.getGuestEmail() == null || request.getGuestEmail().isBlank())) {
            throw new IllegalArgumentException("답변받을 이메일을 입력해주세요.");
        }

        Inquiry inquiry = new Inquiry();
        inquiry.setType(request.getType());
        inquiry.setTitle(request.getTitle());
        inquiry.setContent(request.getContent());
        inquiry.setAuthor(loginUser);
        inquiry.setGuestEmail(loginUser == null ? request.getGuestEmail() : null);

        if (request.getType() == InquiryType.USER_REPORT && request.getReportedUserId() != null) {
            User reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new IllegalArgumentException("신고 대상 사용자를 찾을 수 없습니다."));
            inquiry.setReportedUser(reportedUser);
        }

        if (request.getReportedPostId() != null) {
            CommunityPost post = communityPostRepository.findById(request.getReportedPostId())
                    .orElseThrow(() -> new IllegalArgumentException("신고 대상 게시글을 찾을 수 없습니다."));
            inquiry.setReportedPost(post);
        }

        return new InquiryResponseDto(inquiryRepository.save(inquiry));
    }

    public List<InquiryResponseDto> getMyInquiries(Long userId) {
        return inquiryRepository.findByAuthor_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryResponseDto::new)
                .toList();
    }

    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(InquiryResponseDto::new)
                .toList();
    }

    @Transactional
    public InquiryResponseDto answerInquiry(Long inquiryId, String answer) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));

        inquiry.setAnswer(answer);
        inquiry.setStatus(InquiryStatus.ANSWERED);
        inquiry.setAnsweredAt(LocalDateTime.now());

        return new InquiryResponseDto(inquiry);
    }
}