package com.example.denti_back.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 서버에 저장된 리뷰 이미지를 URL로 조회할 수 있도록 경로를 연결한다.
@Configuration
public class ReviewImageWebConfig implements WebMvcConfigurer {

    @Value("${file.review-upload-dir:uploads/reviews}")
    private String reviewUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path uploadPath = Paths.get(reviewUploadDir)
                .toAbsolutePath()
                .normalize();

        String resourceLocation = uploadPath.toUri().toString();

        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        registry.addResourceHandler("/uploads/reviews/**")
                .addResourceLocations(resourceLocation);
    }
}