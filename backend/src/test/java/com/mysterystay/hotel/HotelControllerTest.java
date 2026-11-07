package com.mysterystay.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.hotel.dto.CreateHotelRequest;
import com.mysterystay.security.jwt.JwtTokenProvider;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HotelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String customerToken;
    private String managerToken;
    private String adminToken;
    private Long managerUserId;

    @BeforeEach
    void setUp() {
        // Ensure test users exist
        User customer = userRepository.findByEmail("customer_test@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("customer_test@mysterystay.com", "hash", "Cust Test", null, UserRole.ROLE_CUSTOMER))
        );
        customerToken = jwtTokenProvider.generateAccessToken(customer.getId(), customer.getEmail(), customer.getRole().name());

        User manager = userRepository.findByEmail("manager_test@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("manager_test@mysterystay.com", "hash", "Manager Test", null, UserRole.ROLE_HOTEL_MANAGER))
        );
        managerUserId = manager.getId();
        managerToken = jwtTokenProvider.generateAccessToken(manager.getId(), manager.getEmail(), manager.getRole().name());

        User admin = userRepository.findByEmail("admin_test@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("admin_test@mysterystay.com", "hash", "Admin Test", null, UserRole.ROLE_ADMIN))
        );
        adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail(), admin.getRole().name());
    }

    @Test
    @DisplayName("GET /api/v1/amenities returns 200 without authentication")
    void getAmenities_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/amenities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/v1/hotels with ROLE_CUSTOMER is rejected with 403 Forbidden")
    void createHotel_Customer_Forbidden() throws Exception {
        CreateHotelRequest request = new CreateHotelRequest(
                "Unauthorized Lodge", null, 3, "Fake Addr", "Bangalore", "Indiranagar", "560038",
                new BigDecimal("12.9716000"), new BigDecimal("77.5946000"), null, null, null
        );

        mockMvc.perform(post("/api/v1/hotels")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Hotel lifecycle: Manager creates hotel -> Admin verifies hotel -> Non-admin verify rejected")
    void hotelLifecycle_CreateAndVerify() throws Exception {
        CreateHotelRequest request = new CreateHotelRequest(
                "Royal Orchid Mystery", "Orchid Group", 5,
                "1 Golf Course Road", "Bangalore", "Domlur", "560008",
                new BigDecimal("12.9600000"), new BigDecimal("77.6400000"),
                "+919876543210", "stay@orchid.com", Set.of()
        );

        // 1. Manager creates hotel
        MvcResult createResult = mockMvc.perform(post("/api/v1/hotels")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Royal Orchid Mystery")))
                .andExpect(jsonPath("$.data.verified", is(false)))
                .andReturn();

        String json = createResult.getResponse().getContentAsString();
        long hotelId = objectMapper.readTree(json).path("data").path("id").asLong();

        // 2. Manager attempts to self-verify -> 403 Forbidden
        mockMvc.perform(patch("/api/v1/admin/hotels/" + hotelId + "/verify?verify=true")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isForbidden());

        // 3. Admin verifies hotel -> 200 OK
        mockMvc.perform(patch("/api/v1/admin/hotels/" + hotelId + "/verify?verify=true")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.verified", is(true)));
    }
}
