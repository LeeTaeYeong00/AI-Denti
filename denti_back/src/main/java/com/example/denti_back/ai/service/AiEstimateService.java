package com.example.denti_back.ai.service;

import com.example.denti_back.ai.dto.AiAnalysisDetailResponse;
import com.example.denti_back.ai.dto.AiAnalysisResponse;
import com.example.denti_back.ai.dto.AiAnalysisSummaryResponse;
import com.example.denti_back.ai.entity.AiAnalysis;
import com.example.denti_back.ai.entity.AiAnalysisDetail;
import com.example.denti_back.ai.entity.AiAnalysisImage;
import com.example.denti_back.ai.enums.DamageType;
import com.example.denti_back.ai.repository.AiAnalysisDetailRepository;
import com.example.denti_back.ai.repository.AiAnalysisImageRepository;
import com.example.denti_back.ai.repository.AiAnalysisRepository;
import com.example.denti_back.member.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiEstimateService {

    private static final int TOTAL_PIXELS = 256 * 256;

    private final RestTemplate restTemplate;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisDetailRepository aiAnalysisDetailRepository;
    private final AiAnalysisImageRepository aiAnalysisImageRepository;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Flask 호출 (내부용)
    public Map<String, Object> requestAnalysis(MultipartFile image) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        };
        body.add("image", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(aiServerUrl + "/analyze", requestEntity, Map.class);
    }

    // 1단계: 분석만 하고 이미지는 임시 디스크에만 저장, DB에는 저장하지 않음
    public AiAnalysisResponse analyzePreview(MultipartFile image) throws IOException {
        Map<String, Object> response = requestAnalysis(image);

        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) response.get("details");
        int totalCost = ((Number) response.get("totalCost")).intValue();

        // 이미지는 저장해두되, DB row는 아직 안 만듦 -> 임시 경로에 저장
        String tempImagePath = saveImageToDisk(image, true);

        List<AiAnalysisDetailResponse> detailResponses = details.keySet().stream()
                .map(key -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> detailData = (Map<String, Object>) details.get(key);
                    int pixelArea = ((Number) detailData.get("pixelArea")).intValue();
                    return new AiAnalysisDetailResponse(
                            mapToDamageType(key),
                            pixelArea,
                            ((Number) detailData.get("estimatedCost")).intValue(),
                            calculatePercentage(pixelArea)
                    );
                })
                .collect(Collectors.toList());

        // analysisId는 아직 없으므로 null, createdAt도 null -> 프론트에서 "미저장 상태"로 판단
        return new AiAnalysisResponse(null, totalCost, null, List.of(tempImagePath), detailResponses);
    }

    // 2단계: 저장 확정 -> 이때 실제로 DB에 저장하고, 임시 이미지를 정식 위치로 옮김
    @Transactional
    public AiAnalysisResponse confirmSave(User user, String tempImagePath, Integer totalCost, List<AiAnalysisDetailResponse> details) {
        AiAnalysis analysis = new AiAnalysis();
        analysis.setUser(user);
        analysis.setTotalCost(totalCost);
        aiAnalysisRepository.save(analysis);

        // 임시 파일을 정식 이미지로 전환 (파일은 그대로 두고 DB row만 생성)
        AiAnalysisImage analysisImage = new AiAnalysisImage();
        analysisImage.setAnalysis(analysis);
        analysisImage.setImageUrl(tempImagePath);
        aiAnalysisImageRepository.save(analysisImage);

        for (AiAnalysisDetailResponse d : details) {
            AiAnalysisDetail detail = new AiAnalysisDetail();
            detail.setAnalysis(analysis);
            detail.setDamageType(d.getDamageType());
            detail.setPixelArea(d.getPixelArea());
            detail.setEstimatedCost(d.getEstimatedCost());
            detail.setDamagePercentage(d.getDamagePercentage());
            aiAnalysisDetailRepository.save(detail);
        }

        return toResponse(analysis);
    }

    public List<AiAnalysisSummaryResponse> getHistory(User user) {
        return aiAnalysisRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(analysis -> {
                    List<AiAnalysisImage> images = aiAnalysisImageRepository.findByAnalysis(analysis);
                    String thumbnail = images.isEmpty() ? null : images.get(0).getImageUrl();
                    return new AiAnalysisSummaryResponse(
                            analysis.getAnalysisId(),
                            analysis.getTotalCost(),
                            analysis.getCreatedAt(),
                            thumbnail
                    );
                })
                .collect(Collectors.toList());
    }

    public AiAnalysisResponse getDetail(Long analysisId, User user) {
        AiAnalysis analysis = aiAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new IllegalArgumentException("분석 결과를 찾을 수 없습니다."));

        if (!analysis.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("본인의 분석 결과만 조회할 수 있습니다.");
        }

        return toResponse(analysis);
    }

    private AiAnalysisResponse toResponse(AiAnalysis analysis) {
        List<String> imageUrls = aiAnalysisImageRepository.findByAnalysis(analysis).stream()
                .map(AiAnalysisImage::getImageUrl)
                .collect(Collectors.toList());

        List<AiAnalysisDetailResponse> details = aiAnalysisDetailRepository.findByAnalysis(analysis).stream()
                .map(d -> new AiAnalysisDetailResponse(d.getDamageType(), d.getPixelArea(), d.getEstimatedCost(), d.getDamagePercentage()))
                .collect(Collectors.toList());

        return new AiAnalysisResponse(analysis.getAnalysisId(), analysis.getTotalCost(), analysis.getCreatedAt(), imageUrls, details);
    }

    private double calculatePercentage(int pixelArea) {
        return Math.round((pixelArea / (double) TOTAL_PIXELS) * 1000) / 10.0;
    }

    private String saveImageToDisk(MultipartFile image, boolean temporary) throws IOException {
        String extension = getExtension(image.getOriginalFilename());
        String prefix = temporary ? "temp_" : "";
        String fileName = prefix + UUID.randomUUID() + extension;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        File dest = new File(dir, fileName);
        image.transferTo(dest);

        return "/uploads/ai/" + fileName;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }

    private DamageType mapToDamageType(String label) {
        if (label.startsWith("Breakage")) return DamageType.BREAKAGE;
        if (label.startsWith("Crushed")) return DamageType.CRUSHED;
        if (label.startsWith("Scratch")) return DamageType.SCRATCH;
        if (label.startsWith("Seperated")) return DamageType.SEPARATED;
        throw new IllegalArgumentException("알 수 없는 파손 유형: " + label);
    }
}