package com.mysterystay.auth.dto;

import com.mysterystay.user.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        String phone,

        UserRole role
) {
    public UserRole resolvedRole() {
        return role != null ? role : UserRole.ROLE_CUSTOMER;
    }
}
