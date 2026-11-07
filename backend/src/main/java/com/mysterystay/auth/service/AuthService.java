package com.mysterystay.auth.service;

import com.mysterystay.auth.dto.AuthResponse;
import com.mysterystay.auth.dto.LoginRequest;
import com.mysterystay.auth.dto.RefreshTokenRequest;
import com.mysterystay.auth.dto.RegisterRequest;
import com.mysterystay.auth.dto.UserProfileResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    UserProfileResponse getCurrentUser(String email);
}
