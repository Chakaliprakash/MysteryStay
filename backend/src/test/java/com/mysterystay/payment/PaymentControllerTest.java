package com.mysterystay.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.model.BookingStatus;
import com.mysterystay.booking.repository.BookingRepository;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.payment.dto.CreatePaymentOrderRequest;
import com.mysterystay.payment.dto.CreateUpiPaymentOrderRequest;
import com.mysterystay.payment.dto.VerifyPaymentRequest;
import com.mysterystay.payment.dto.VerifyUpiPaymentRequest;
import com.mysterystay.payment.model.Payment;
import com.mysterystay.payment.repository.PaymentRepository;
import com.mysterystay.payment.service.PaymentServiceImpl;
import com.mysterystay.security.jwt.JwtTokenProvider;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentControllerTest {

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
    private MysteryDealRepository mysteryDealRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${app.razorpay.key-secret:MysteryStaySecretSandbox2026}")
    private String keySecret;

    private User traveler;
    private String travelerToken;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        mysteryDealRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        userRepository.deleteAll();

        traveler = new User(
                "alex.payment@example.com",
                "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                "Alex Morgan",
                "+919876543210",
                UserRole.ROLE_CUSTOMER
        );
        traveler = userRepository.save(traveler);
        travelerToken = jwtTokenProvider.generateAccessToken(traveler.getId(), traveler.getEmail(), traveler.getRole().name());

        User manager = new User(
                "manager.pay@example.com",
                "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                "Manager Roy",
                "+919876543211",
                UserRole.ROLE_HOTEL_MANAGER
        );
        manager = userRepository.save(manager);

        Hotel hotel = new Hotel(
                manager,
                "The Grand Azure Palace",
                "Azure Collection",
                5,
                "42 MG Road",
                "Bangalore",
                "Indiranagar",
                "560038",
                BigDecimal.valueOf(12.9716),
                BigDecimal.valueOf(77.5946),
                "+918023456789",
                "res@azure.com"
        );
        hotel.setVerified(true);
        hotel = hotelRepository.save(hotel);

        RoomType roomType = new RoomType(
                hotel,
                "Executive Sea Suite",
                RoomCategory.EXECUTIVE_SUITE,
                "Ocean view suite",
                2,
                1,
                new BigDecimal("300.00")
        );
        roomType = roomTypeRepository.save(roomType);

        MysteryDeal deal = new MysteryDeal(
                roomType,
                "5-Star Waterfront Splendor",
                "Panoramic ocean vistas",
                40,
                new BigDecimal("180.00"),
                LocalDate.now(),
                LocalDate.now().plusMonths(1)
        );
        deal = mysteryDealRepository.save(deal);

        testBooking = new Booking(
                "BK-PAYTEST1",
                traveler,
                hotel,
                roomType,
                deal,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                1,
                2,
                0,
                "Alex Morgan",
                "alex.payment@example.com",
                "+919876543210",
                new BigDecimal("180.00"),
                new BigDecimal("360.00"),
                Instant.now().plus(15, ChronoUnit.MINUTES),
                "Quiet room"
        );
        testBooking = bookingRepository.save(testBooking);
    }

    @Test
    @DisplayName("POST /api/v1/payments/create-order: Initializes Razorpay sandbox order for valid booking")
    void createPaymentOrder_AuthenticatedTraveler_Returns201() throws Exception {
        CreatePaymentOrderRequest request = new CreatePaymentOrderRequest(testBooking.getId());

        mockMvc.perform(post("/api/v1/payments/create-order")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.bookingId", is(testBooking.getId().intValue())))
                .andExpect(jsonPath("$.data.amount", is(360.00)))
                .andExpect(jsonPath("$.data.status", is("CREATED")));
    }

    @Test
    @DisplayName("POST /api/v1/payments/verify: Valid signature confirms booking and reveals hotel credentials")
    void verifyPayment_ValidSignature_Returns200AndConfirmedBooking() throws Exception {
        String orderId = "order_testPay12345";
        String paymentId = "pay_testPay67890";
        String validSignature = PaymentServiceImpl.calculateHmacSha256(orderId + "|" + paymentId, keySecret);

        Payment payment = new Payment(testBooking.getId(), orderId, testBooking.getTotalAmount(), "USD");
        paymentRepository.save(payment);

        VerifyPaymentRequest request = new VerifyPaymentRequest(orderId, paymentId, validSignature);

        mockMvc.perform(post("/api/v1/payments/verify")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.signatureValid", is(true)))
                .andExpect(jsonPath("$.data.bookingConfirmed", is(true)))
                .andExpect(jsonPath("$.data.booking.identityRevealed", is(true)))
                .andExpect(jsonPath("$.data.booking.hotelName", is("The Grand Azure Palace")))
                .andExpect(jsonPath("$.data.booking.hotelAddress", is("42 MG Road")));
    }

    @Test
    @DisplayName("POST /api/v1/payments/verify: Invalid signature returns 400 and does NOT confirm booking")
    void verifyPayment_InvalidSignature_Returns400() throws Exception {
        String orderId = "order_testPay12345";
        String paymentId = "pay_testPay67890";
        String fakeSignature = "invalid_tampered_signature";

        Payment payment = new Payment(testBooking.getId(), orderId, testBooking.getTotalAmount(), "USD");
        paymentRepository.save(payment);

        VerifyPaymentRequest request = new VerifyPaymentRequest(orderId, paymentId, fakeSignature);

        mockMvc.perform(post("/api/v1/payments/verify")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("POST /api/v1/payments/upi/create-order: Initializes UPI QR session with dynamic amount and UPI URI")
    void createUpiPaymentOrder_Success() throws Exception {
        CreateUpiPaymentOrderRequest request = new CreateUpiPaymentOrderRequest(testBooking.getId());

        mockMvc.perform(post("/api/v1/payments/upi/create-order")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.upiId", is("6302714896@mbk")))
                .andExpect(jsonPath("$.data.currency", is("INR")))
                .andExpect(jsonPath("$.data.upiUri").isString())
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.paymentReference").isString());
    }

    @Test
    @DisplayName("POST /api/v1/payments/upi/verify: Verifies UPI payment and reveals secret hotel identity")
    void verifyUpiPayment_Success() throws Exception {
        // First create order
        CreateUpiPaymentOrderRequest createReq = new CreateUpiPaymentOrderRequest(testBooking.getId());
        String createRes = mockMvc.perform(post("/api/v1/payments/upi/create-order")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String paymentRef = objectMapper.readTree(createRes).path("data").path("paymentReference").asText();

        // Verify payment
        VerifyUpiPaymentRequest verifyReq = new VerifyUpiPaymentRequest(paymentRef, "UPI_UTR_TEST123456", "Paid via PhonePe");

        mockMvc.perform(post("/api/v1/payments/upi/verify")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.bookingConfirmed", is(true)))
                .andExpect(jsonPath("$.data.booking.identityRevealed", is(true)))
                .andExpect(jsonPath("$.data.booking.hotelName", is("The Grand Azure Palace")));
    }
}
