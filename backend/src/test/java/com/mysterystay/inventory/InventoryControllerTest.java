package com.mysterystay.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.dto.CreateRoomTypeRequest;
import com.mysterystay.inventory.dto.SeedInventoryRequest;
import com.mysterystay.inventory.model.RoomCategory;
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
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String managerToken;
    private String customerToken;
    private Long verifiedHotelId;

    @BeforeEach
    void setUp() {
        User manager = userRepository.findByEmail("inv_manager@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("inv_manager@mysterystay.com", "hash", "Inv Manager", null, UserRole.ROLE_HOTEL_MANAGER))
        );
        managerToken = jwtTokenProvider.generateAccessToken(manager.getId(), manager.getEmail(), manager.getRole().name());

        User customer = userRepository.findByEmail("inv_customer@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("inv_customer@mysterystay.com", "hash", "Inv Cust", null, UserRole.ROLE_CUSTOMER))
        );
        customerToken = jwtTokenProvider.generateAccessToken(customer.getId(), customer.getEmail(), customer.getRole().name());

        Hotel hotel = hotelRepository.findByManagerId(manager.getId()).stream().findFirst().orElseGet(() -> {
            Hotel h = new Hotel(manager, "Azure Bay Resort", "Azure", 5, "Beach Road",
                    "Goa", "Candolim", "403515", BigDecimal.ZERO, BigDecimal.ZERO, null, null);
            h.setVerified(true); // Must be verified
            return hotelRepository.save(h);
        });
        verifiedHotelId = hotel.getId();
    }

    @Test
    @DisplayName("Inventory lifecycle: Manager creates RoomType -> Seeds 3-day calendar -> Public checks availability")
    void inventoryLifecycle() throws Exception {
        // 1. Create Room Type
        CreateRoomTypeRequest roomReq = new CreateRoomTypeRequest(
                "Executive Sea View Suite",
                RoomCategory.EXECUTIVE_SUITE,
                "Balcony overlooking ocean",
                2,
                1,
                new BigDecimal("350.00")
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/hotels/" + verifiedHotelId + "/room-types")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roomReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Executive Sea View Suite")))
                .andReturn();

        long roomTypeId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Seed 3-day inventory
        LocalDate start = LocalDate.now().plusDays(2);
        LocalDate end = LocalDate.now().plusDays(4); // 3 days

        SeedInventoryRequest seedReq = new SeedInventoryRequest(start, end, 8, null);

        mockMvc.perform(post("/api/v1/hotels/" + verifiedHotelId + "/room-types/" + roomTypeId + "/inventory")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(seedReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(3)));

        // 3. Public checks availability across 2 nights
        mockMvc.perform(get("/api/v1/room-types/" + roomTypeId + "/availability")
                        .param("checkInDate", start.toString())
                        .param("checkOutDate", start.plusDays(2).toString())
                        .param("roomCount", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.available", is(true)))
                .andExpect(jsonPath("$.data.totalNights", is(2)))
                .andExpect(jsonPath("$.data.totalCost", is(1400.00))); // 2 nights * 2 rooms * 350.00
    }

    @Test
    @DisplayName("POST room-types with ROLE_CUSTOMER is rejected with 403 Forbidden")
    void createRoomType_Customer_Forbidden() throws Exception {
        CreateRoomTypeRequest roomReq = new CreateRoomTypeRequest(
                "Standard Room", RoomCategory.STANDARD, null, 2, 0, new BigDecimal("100.00")
        );

        mockMvc.perform(post("/api/v1/hotels/" + verifiedHotelId + "/room-types")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roomReq)))
                .andExpect(status().isForbidden());
    }
}
