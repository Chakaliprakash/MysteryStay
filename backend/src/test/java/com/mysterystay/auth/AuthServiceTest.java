package com.mysterystay.auth;

import com.mysterystay.auth.dto.AuthResponse;
import com.mysterystay.auth.dto.LoginRequest;
import com.mysterystay.auth.dto.RefreshTokenRequest;
import com.mysterystay.auth.dto.RegisterRequest;
import com.mysterystay.auth.model.RefreshToken;
import com.mysterystay.auth.repository.RefreshTokenRepository;
import com.mysterystay.auth.service.AuthServiceImpl;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.security.jwt.JwtTokenProvider;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, refreshTokenRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    @DisplayName("register: creates user, hashes password, saves and returns auth response")
    void register_Success() {
        RegisterRequest request = new RegisterRequest(
                "traveler@test.com", "Secret123!", "Jane Doe", "+123456789", UserRole.ROLE_CUSTOMER
        );

        when(userRepository.existsByEmail("traveler@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("hashedPassword");

        User savedUser = new User("traveler@test.com", "hashedPassword", "Jane Doe", "+123456789", UserRole.ROLE_CUSTOMER);
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtTokenProvider.generateAccessToken(eq(10L), eq("traveler@test.com"), eq("ROLE_CUSTOMER")))
                .thenReturn("mocked.access.jwt");
        when(jwtTokenProvider.generateOpaqueRefreshToken()).thenReturn("mocked-refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("mocked.access.jwt");
        assertThat(response.refreshToken()).isEqualTo("mocked-refresh-token");
        assertThat(response.user().email()).isEqualTo("traveler@test.com");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("register: throws conflict exception when email is already registered")
    void register_DuplicateEmail_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest(
                "existing@test.com", "Secret123!", "Jane Doe", null, UserRole.ROLE_CUSTOMER
        );

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("Email is already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login: returns tokens on valid credentials")
    void login_Success() {
        LoginRequest request = new LoginRequest("traveler@test.com", "Secret123!");

        User existingUser = new User("traveler@test.com", "hashedSecret", "Jane Doe", null, UserRole.ROLE_CUSTOMER);
        existingUser.setId(5L);

        when(userRepository.findByEmail("traveler@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Secret123!", "hashedSecret")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(eq(5L), eq("traveler@test.com"), eq("ROLE_CUSTOMER")))
                .thenReturn("mocked.access.jwt");
        when(jwtTokenProvider.generateOpaqueRefreshToken()).thenReturn("mocked-refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("mocked.access.jwt");
        verify(refreshTokenRepository).revokeAllActiveTokensForUser(existingUser);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("login: throws UNAUTHORIZED on invalid password")
    void login_InvalidPassword_ThrowsUnauthorized() {
        LoginRequest request = new LoginRequest("traveler@test.com", "WrongPassword");

        User existingUser = new User("traveler@test.com", "hashedSecret", "Jane Doe", null, UserRole.ROLE_CUSTOMER);
        when(userRepository.findByEmail("traveler@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("WrongPassword", "hashedSecret")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);

        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("refreshToken: rotates valid token and returns new access/refresh tokens")
    void refreshToken_Success() {
        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh-token");

        User user = new User("traveler@test.com", "pass", "Jane", null, UserRole.ROLE_CUSTOMER);
        user.setId(8L);

        RefreshToken existingToken = new RefreshToken(user, "valid-refresh-token", Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByTokenHash("valid-refresh-token")).thenReturn(Optional.of(existingToken));
        when(jwtTokenProvider.generateAccessToken(eq(8L), eq("traveler@test.com"), eq("ROLE_CUSTOMER")))
                .thenReturn("new.access.jwt");
        when(jwtTokenProvider.generateOpaqueRefreshToken()).thenReturn("new-opaque-refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.refreshToken(request);

        assertThat(response.accessToken()).isEqualTo("new.access.jwt");
        assertThat(response.refreshToken()).isEqualTo("new-opaque-refresh-token");
        assertThat(existingToken.isRevoked()).isTrue();
    }
}
