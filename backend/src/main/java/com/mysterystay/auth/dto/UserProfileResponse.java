package com.mysterystay.auth.dto;

import com.mysterystay.user.model.User;

import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        String role,
        Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
