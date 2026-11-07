package com.mysterystay.deal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.deal.dto.CreateMysteryDealRequest;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
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
class DealControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String managerToken;
    private String customerToken;
    private Long roomTypeId;

    @BeforeEach
    void setUp() {
        User manager = userRepository.findByEmail("deal_mgr@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("deal_mgr@mysterystay.com", "hash", "Deal Manager", null, UserRole.ROLE_HOTEL_MANAGER))
        );
        managerToken = jwtTokenProvider.generateAccessToken(manager.getId(), manager.getEmail(), manager.getRole().name());

        User customer = userRepository.findByEmail("deal_cust@mysterystay.com").orElseGet(() ->
                userRepository.save(new User("deal_cust@mysterystay.com", "hash", "Deal Cust", null, UserRole.ROLE_CUSTOMER))
        );
        customerToken = jwtTokenProvider.generateAccessToken(customer.getId(), customer.getEmail(), customer.getRole().name());

        Hotel hotel = hotelRepository.findByManagerId(manager.getId()).stream().findFirst().orElseGet(() -> {
            Hotel h = new Hotel(manager, "Secret Grand Hotel", "Secret Chain", 5, "123 Classified Street",
                    "Mumbai", "Bandra West", "400050", BigDecimal.ZERO, BigDecimal.ZERO, "+9122334455", "confidential@hotel.com");
            h.setVerified(true);
            return hotelRepository.save(h);
        });

        RoomType rt = roomTypeRepository.findByHotelIdAndActiveTrue(hotel.getId()).stream().findFirst().orElseGet(() ->
                roomTypeRepository.save(new RoomType(hotel, "Presidential Penthouse", RoomCategory.PRESIDENTIAL_SUITE, "Top floor", 2, 2, new BigDecimal("500.00")))
        );
        roomTypeId = rt.getId();
    }

    @Test
    @DisplayName("Deal lifecycle: Manager creates deal -> Public browses masked deal -> Verifies ZERO identity leakage")
    void dealLifecycle_IdentityMasking() throws Exception {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(14);

        CreateMysteryDealRequest request = new CreateMysteryDealRequest(
                roomTypeId,
                "5-Star Oceanfront Splendor in Bandra",
                "Minutes away from coastal promenades and bespoke dining.",
                45, // 45% discount: 500 * (1 - 0.45) = 275.00
                start,
                end
        );

        // 1. Manager publishes deal
        mockMvc.perform(post("/api/v1/deals")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.discountPercent", is(45)))
                .andExpect(jsonPath("$.data.mysteryPrice", is(275.00)));

        // 2. Public browses active mystery deals without authentication
        mockMvc.perform(get("/api/v1/deals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                // Validates presence of masked clue attributes
                .andExpect(jsonPath("$.data[0].mysteryTitle", notNullValue()))
                .andExpect(jsonPath("$.data[0].zoneArea", notNullValue()))
                .andExpect(jsonPath("$.data[0].city", notNullValue()))
                .andExpect(jsonPath("$.data[0].starRating", notNullValue()))
                .andExpect(jsonPath("$.data[0].mysteryPrice", notNullValue()))
                // Strictly asserts NO identity leaks!
                .andExpect(jsonPath("$.data[0].hotelName").doesNotExist())
                .andExpect(jsonPath("$.data[0].name").doesNotExist())
                .andExpect(jsonPath("$.data[0].address").doesNotExist())
                .andExpect(jsonPath("$.data[0].brandChain").doesNotExist())
                .andExpect(jsonPath("$.data[0].phone").doesNotExist())
                .andExpect(jsonPath("$.data[0].email").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/deals with ROLE_CUSTOMER is rejected with 403 Forbidden")
    void createDeal_Customer_Forbidden() throws Exception {
        CreateMysteryDealRequest request = new CreateMysteryDealRequest(
                roomTypeId, "Fake Title", "Fake Clues", 20, LocalDate.now(), LocalDate.now().plusDays(5)
        );

        mockMvc.perform(post("/api/v1/deals")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
