package com.example.denti_back.review.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.denti_back.review.dto.response.ReviewImageResponse;
import com.example.denti_back.review.service.ReviewImageService;

import lombok.RequiredArgsConstructor;

// 리뷰 이미지 등록과 삭제에 관한 HTTP 요청을 처리한다.
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewImageController {

    private final ReviewImageService reviewImageService;

    // 리뷰 작성자가 본인의 리뷰에 이미지를 추가한다.
    // 파일 전송을 위해 multipart/form-data 형식의 요청을 받는다.
    @PostMapping(
            value = "/{reviewId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ReviewImageResponse>> uploadImages(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestPart("files") List<MultipartFile> files) {

        List<ReviewImageResponse> responses =
                reviewImageService.uploadImages(
                        reviewId,
                        currentUserId,
                        files);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(responses);
    }

    // 리뷰 작성자가 등록한 이미지 한 장을 삭제한다.
    @DeleteMapping("/images/{reviewImageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long reviewImageId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        reviewImageService.deleteImage(
                reviewImageId,
                currentUserId);

        return ResponseEntity.noContent().build();
    }
}