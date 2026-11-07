package com.mysterystay.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.auth.dto.LoginRequest;
import com.mysterystay.auth.dto.RegisterRequest;
import com.mysterystay.user.model.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/auth/register creates user and returns 201 with JWT")
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "newuser@mysterystay.com",
                "StrongPassword123!",
                "Alice Smith",
                "+919876543210",
                UserRole.ROLE_CUSTOMER
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("newuser@mysterystay.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_CUSTOMER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register fails with 400 when validation rules violated")
    void register_ValidationFailure() throws Exception {
        RegisterRequest badRequest = new RegisterRequest(
                "invalid-email",
                "short",
                "",
                null,
                null
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.data.email", notNullValue()))
                .andExpect(jsonPath("$.data.password", notNullValue()))
                .andExpect(jsonPath("$.data.fullName", notNullValue()));
    }

    @Test
    @DisplayName("Full auth cycle: register -> login -> access /me -> unauthenticated access rejected")
    void fullAuthCycle() throws Exception {
        String uniqueEmail = "cycle_" + System.currentTimeMillis() + "@mysterystay.com";

        // 1. Register
        RegisterRequest registerReq = new RegisterRequest(
                uniqueEmail,
                "StrongPassword123!",
                "Cycle Tester",
                null,
                UserRole.ROLE_CUSTOMER
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // 2. Login
        LoginRequest loginReq = new LoginRequest(uniqueEmail, "StrongPassword123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andReturn();

        String jsonResponse = loginResult.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(jsonResponse).path("data").path("accessToken").asText();

        // 3. Access /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(uniqueEmail)))
                .andExpect(jsonPath("$.data.role", is("ROLE_CUSTOMER")));

        // 4. Access /api/v1/auth/me without Bearer token -> rejected with 401
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("authentication is required")));
    }
}
