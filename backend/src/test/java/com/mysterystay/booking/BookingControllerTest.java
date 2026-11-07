package com.mysterystay.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.booking.dto.CreateBookingRequest;
import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.repository.BookingRepository;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.dto.SeedInventoryRequest;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomInventoryRepository;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.inventory.service.InventoryService;
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
class BookingControllerTest {

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
    private RoomInventoryRepository roomInventoryRepository;

    @Autowired
    private MysteryDealRepository mysteryDealRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String customerToken;
    private Long testDealId;
    private Long testRoomTypeId;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        mysteryDealRepository.deleteAll();
        roomInventoryRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        userRepository.deleteAll();

        User manager = new User(
                "hotel.manager@mysterystay.com",
                "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                "Manager Taj",
                "+919876543210",
                UserRole.ROLE_HOTEL_MANAGER
        );
        manager = userRepository.save(manager);

        User customer = new User(
                "traveler.alex@mysterystay.com",
                "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                "Alex Morgan",
                "+919876543211",
                UserRole.ROLE_CUSTOMER
        );
        customer = userRepository.save(customer);
        customerToken = jwtTokenProvider.generateAccessToken(customer.getId(), customer.getEmail(), customer.getRole().name());

        Hotel hotel = new Hotel(
                manager,
                "The Confidential Palace",
                "Palace Group",
                5,
                "12 Royal Enclave, Bandra West",
                "Mumbai",
                "Bandra West",
                "400050",
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "+912233445566",
                "concierge@palace.com"
        );
        hotel.setVerified(true);
        hotel = hotelRepository.save(hotel);

        RoomType roomType = new RoomType(
                hotel,
                "Executive Palace Suite",
                RoomCategory.EXECUTIVE_SUITE,
                "Spacious suite with balcony",
                2,
                1,
                BigDecimal.valueOf(400.0)
        );
        roomType = roomTypeRepository.save(roomType);
        testRoomTypeId = roomType.getId();

        // Seed 14 days of inventory (10 rooms per day)
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(14);
        inventoryService.seedInventory(
                hotel.getId(),
                roomType.getId(),
                new SeedInventoryRequest(start, end, 10, null),
                manager.getId(),
                false
        );

        MysteryDeal deal = new MysteryDeal(
                roomType,
                "5-Star Waterfront Splendor in Bandra",
                "Featuring private balconies and coastal vistas",
                40,
                BigDecimal.valueOf(240.0),
                start,
                end
        );
        deal = mysteryDealRepository.save(deal);
        testDealId = deal.getId();
    }

    @Test
    @DisplayName("Booking Lifecycle: Traveler reserves deal -> Verifies identity masked -> Confirms -> Verifies identity revealed")
    void fullBookingLifecycle_IdentityRevealedPostConfirmation() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = checkIn.plusDays(2); // 2 nights

        CreateBookingRequest request = new CreateBookingRequest(
                null,
                testDealId,
                checkIn,
                checkOut,
                1,
                2,
                0,
                "Alex Morgan",
                "traveler.alex@mysterystay.com",
                "+919876543211",
                "Quiet room preferred"
        );

        // 1. Create booking in PENDING_PAYMENT state
        String createResponse = mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.data.stayNights").value(2))
                .andExpect(jsonPath("$.data.nightlyRate").value(240.0))
                .andExpect(jsonPath("$.data.totalAmount").value(480.0))
                // IDENTITY MUST BE STRICTLY MASKED BEFORE PAYMENT:
                .andExpect(jsonPath("$.data.identityRevealed").value(false))
                .andExpect(jsonPath("$.data.hotelName").value("Confidential 5-Star Hotel Partner"))
                .andExpect(jsonPath("$.data.hotelPhone").doesNotExist())
                .andExpect(jsonPath("$.data.hotelEmail").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        Long bookingId = objectMapper.readTree(createResponse).path("data").path("bookingId").asLong();

        // 2. Confirm booking (Simulates payment webhook success)
        mockMvc.perform(post("/api/v1/bookings/" + bookingId + "/confirm")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                // IDENTITY MUST BE UNLOCKED POST-PAYMENT:
                .andExpect(jsonPath("$.data.identityRevealed").value(true))
                .andExpect(jsonPath("$.data.hotelName").value("The Confidential Palace"))
                .andExpect(jsonPath("$.data.hotelAddress").value("12 Royal Enclave, Bandra West"))
                .andExpect(jsonPath("$.data.hotelPhone").value("+912233445566"))
                .andExpect(jsonPath("$.data.hotelEmail").value("concierge@palace.com"));

        // 3. Inspect My Bookings
        mockMvc.perform(get("/api/v1/bookings/my")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data[0].hotelName").value("The Confidential Palace"));
    }
}
