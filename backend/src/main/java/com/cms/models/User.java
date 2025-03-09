package com.cms.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false, length = 20)
    private String role = "user";

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "last_login")
    private ZonedDateTime lastLogin;

    @Column(name = "is_active")
    private boolean isActive = true;
} 