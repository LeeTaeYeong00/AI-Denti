package com.example.denti_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

// DB 자동 설정을 일시적으로 제외 (DataSourceAutoConfiguration.class)
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class DentiBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(DentiBackApplication.class, args);
    }

}