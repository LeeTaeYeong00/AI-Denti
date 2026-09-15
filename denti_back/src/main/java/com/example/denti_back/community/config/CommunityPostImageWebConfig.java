package com.example.denti_back.community.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 서버에 저장된 게시글 이미지를 브라우저에서 조회할 수 있도록 연결한다.
@Configuration
public class CommunityPostImageWebConfig
        implements WebMvcConfigurer {

    @Value("${file.community-upload-dir:uploads/community}")
    private String communityUploadDir;

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        Path uploadPath =
                Paths.get(communityUploadDir)
                        .toAbsolutePath()
                        .normalize();

        String resourceLocation =
                uploadPath.toUri().toString();

        // 파일 시스템 경로가 폴더 경로로 인식되도록
        // 마지막에 슬래시가 없으면 추가한다.
        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        registry
                .addResourceHandler(
                        "/uploads/community/**"
                )
                .addResourceLocations(
                        resourceLocation
                );
    }
}