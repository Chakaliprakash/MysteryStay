package com.mysterystay.search;

import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private MysteryDealRepository mysteryDealRepository;

    private Long testDealId;

    @BeforeEach
    void setUp() {
        mysteryDealRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        userRepository.deleteAll();

        User manager = new User(
                "search.manager@example.com",
                "$2a$12$K8y4X0GZfB7P1E0T0mX0eO7f9V8Z1Q2W3E4R5T6Y7U8I9O0P1A2S",
                "Manager Search",
                "+919876543210",
                UserRole.ROLE_HOTEL_MANAGER
        );
        manager = userRepository.save(manager);

        Hotel hotel = new Hotel(
                manager,
                "Secret Grand Palace",
                "Grand Chains",
                5,
                "42 MG Road, Bangalore",
                "Bangalore",
                "Indiranagar",
                "560038",
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "+918023456789",
                "secret@grandpalace.com"
        );
        hotel.setVerified(true);
        hotel = hotelRepository.save(hotel);

        RoomType roomType = new RoomType(
                hotel,
                "Royal Suite",
                RoomCategory.EXECUTIVE_SUITE,
                "Top-tier luxury hotel suite",
                2,
                1,
                BigDecimal.valueOf(300.0)
        );
        roomType = roomTypeRepository.save(roomType);

        MysteryDeal deal = new MysteryDeal(
                roomType,
                "Secret 5-Star Haven in Indiranagar",
                "Featuring private balconies and spa",
                40,
                BigDecimal.valueOf(180.0),
                LocalDate.now(),
                LocalDate.now().plusDays(10)
        );
        deal = mysteryDealRepository.save(deal);
        testDealId = deal.getId();
    }

    @Test
    @DisplayName("GET /api/v1/search/deals returns top-K ranked deals with strict identity masking")
    void searchDeals_publicAccess_returnsRankedDealsWithZeroIdentityLeakage() throws Exception {
        mockMvc.perform(get("/api/v1/search/deals")
                        .param("city", "Bangalore")
                        .param("minRating", "4")
                        .param("k", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.deals", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.deals[0].deal.city").value("Bangalore"))
                .andExpect(jsonPath("$.data.deals[0].deal.starRating").value(5))
                .andExpect(jsonPath("$.data.deals[0].deal.mysteryPrice").value(180.0))
                .andExpect(jsonPath("$.data.deals[0].valueScore").isNumber())
                .andExpect(jsonPath("$.data.algorithmUsed").value(containsString("Bounded Min-Heap")))
                // STRICT IDENTITY MASKING GUARANTEES:
                .andExpect(jsonPath("$.data.deals[0].deal.hotelName").doesNotExist())
                .andExpect(jsonPath("$.data.deals[0].deal.address").doesNotExist())
                .andExpect(jsonPath("$.data.deals[0].deal.phone").doesNotExist())
                .andExpect(jsonPath("$.data.deals[0].deal.email").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/v1/search/deals/{dealId}/best-window returns sliding window optimal stay window")
    void getBestStayWindow_returnsOptimalStayWindow() throws Exception {
        mockMvc.perform(get("/api/v1/search/deals/" + testDealId + "/best-window")
                        .param("stayLength", "3")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dealId").value(testDealId))
                .andExpect(jsonPath("$.data.stayLength").value(3))
                .andExpect(jsonPath("$.data.bestCheckInDate").isNotEmpty())
                .andExpect(jsonPath("$.data.bestCheckOutDate").isNotEmpty())
                .andExpect(jsonPath("$.data.totalCost").isNumber())
                .andExpect(jsonPath("$.data.algorithmUsed").value(containsString("Sliding Window")));
    }
}
