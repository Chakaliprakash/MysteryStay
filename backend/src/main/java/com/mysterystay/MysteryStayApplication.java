package com.mysterystay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MysteryStayApplication {

    public static void main(String[] args) {
        SpringApplication.run(MysteryStayApplication.class, args);
    }
}
