package com.mysterystay.auth.service;

import com.mysterystay.auth.dto.AuthResponse;
import com.mysterystay.auth.dto.LoginRequest;
import com.mysterystay.auth.dto.RefreshTokenRequest;
import com.mysterystay.auth.dto.RegisterRequest;
import com.mysterystay.auth.dto.UserProfileResponse;
import com.mysterystay.auth.model.RefreshToken;
import com.mysterystay.auth.repository.RefreshTokenRepository;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.security.jwt.JwtTokenProvider;
import com.mysterystay.user.model.User;
import com.mysterystay.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException("Email is already registered: " + normalizedEmail, HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.phone() != null ? request.phone().trim() : null,
                request.resolvedRole()
        );

        User savedUser = userRepository.save(user);
        log.info("New user registered successfully with ID: {} and role: {}", savedUser.getId(), savedUser.getRole());

        return createAuthResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
        }

        if (!user.isActive()) {
            throw new AppException("Your account has been deactivated. Please contact support.", HttpStatus.FORBIDDEN, "ACCOUNT_DEACTIVATED");
        }

        // Revoke active refresh tokens on new login to prevent session accumulation
        refreshTokenRepository.revokeAllActiveTokensForUser(user);

        log.info("User logged in successfully: {}", user.getEmail());
        return createAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(request.refreshToken())
                .orElseThrow(() -> new AppException("Invalid refresh token", HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN"));

        if (!token.isValid()) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new AppException("Refresh token is expired or revoked. Please log in again.", HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_EXPIRED");
        }

        User user = token.getUser();
        if (!user.isActive()) {
            throw new AppException("Account is deactivated", HttpStatus.FORBIDDEN, "ACCOUNT_DEACTIVATED");
        }

        // Token rotation: revoke current token and issue fresh one
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return createAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(refreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
                log.info("Refresh token revoked on logout for user: {}", token.getUser().getEmail());
            });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User profile not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        return UserProfileResponse.from(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        String opaqueRefreshToken = jwtTokenProvider.generateOpaqueRefreshToken();
        Instant refreshExpiry = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs());

        RefreshToken refreshTokenEntity = new RefreshToken(user, opaqueRefreshToken, refreshExpiry);
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.of(
                accessToken,
                opaqueRefreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
                UserProfileResponse.from(user)
        );
    }
}
