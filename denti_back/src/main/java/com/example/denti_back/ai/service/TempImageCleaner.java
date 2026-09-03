package com.example.denti_back.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class TempImageCleaner {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 1시간마다 실행, temp_ 로 시작하는 파일 중 생성된 지 1시간 지난 것 삭제
    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void cleanupTempImages() {
        File dir = new File(uploadDir);
        File[] files = dir.listFiles((d, name) -> name.startsWith("temp_"));
        if (files == null) return;

        Instant cutoff = Instant.now().minus(1, ChronoUnit.HOURS);

        for (File file : files) {
            try {
                Instant lastModified = Files.getLastModifiedTime(file.toPath()).toInstant();
                if (lastModified.isBefore(cutoff)) {
                    file.delete();
                }
            } catch (Exception ignored) {
            }
        }
    }
}