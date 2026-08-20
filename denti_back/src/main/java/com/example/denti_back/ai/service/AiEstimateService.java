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

    @Transactional
    public AiAnalysisResponse analyzeAndSave(MultipartFile image, User user) throws IOException {
        Map<String, Object> response = requestAnalysis(image);

        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) response.get("details");
        int totalCost = ((Number) response.get("totalCost")).intValue();

        AiAnalysis analysis = new AiAnalysis();
        analysis.setUser(user);
        analysis.setTotalCost(totalCost);
        aiAnalysisRepository.save(analysis);

        String savedPath = saveImageToDisk(image);
        AiAnalysisImage analysisImage = new AiAnalysisImage();
        analysisImage.setAnalysis(analysis);
        analysisImage.setImageUrl(savedPath);
        aiAnalysisImageRepository.save(analysisImage);

        for (String key : details.keySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> detailData = (Map<String, Object>) details.get(key);
            int pixelArea = ((Number) detailData.get("pixelArea")).intValue();

            AiAnalysisDetail detail = new AiAnalysisDetail();
            detail.setAnalysis(analysis);
            detail.setDamageType(mapToDamageType(key));
            detail.setPixelArea(pixelArea);
            detail.setEstimatedCost(((Number) detailData.get("estimatedCost")).intValue());
            detail.setDamagePercentage(calculatePercentage(pixelArea));
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

    private String saveImageToDisk(MultipartFile image) throws IOException {
        String extension = getExtension(image.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;

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