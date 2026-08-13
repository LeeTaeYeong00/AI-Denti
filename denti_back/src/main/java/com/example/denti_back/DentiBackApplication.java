package com.example.denti_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = (DataSourceAutoConfiguration.class))
public class DentiBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(DentiBackApplication.class, args);
	}

}
