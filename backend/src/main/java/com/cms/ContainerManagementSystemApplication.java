package com.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication
public class ContainerManagementSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContainerManagementSystemApplication.class, args);
    }
} 