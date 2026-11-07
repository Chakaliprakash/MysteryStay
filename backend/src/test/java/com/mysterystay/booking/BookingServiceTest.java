package com.mysterystay.booking;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.dto.CreateBookingRequest;
import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.model.BookingStatus;
import com.mysterystay.booking.repository.BookingRepository;
import com.mysterystay.booking.service.BookingServiceImpl;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.inventory.service.InventoryService;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private MysteryDealRepository mysteryDealRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User traveler;
    private Hotel hotel;
    private RoomType roomType;
    private MysteryDeal deal;

    @BeforeEach
    void setUp() {
        traveler = new User("traveler@example.com", "hash", "Alex Morgan", "+919876543210", UserRole.ROLE_CUSTOMER);
        traveler.setId(10L);

        User manager = new User("manager@example.com", "hash", "Manager", "+919876543211", UserRole.ROLE_HOTEL_MANAGER);
        manager.setId(20L);

        hotel = new Hotel(manager, "Secret Taj Grand", "Taj Collection", 5, "Bandra West, Mumbai",
                "Mumbai", "Bandra West", "400050", BigDecimal.ZERO, BigDecimal.ZERO, "+912266681234", "concierge@taj.com");
        hotel.setId(100L);
        hotel.setVerified(true);

        roomType = new RoomType(hotel, "Ocean Suite", RoomCategory.EXECUTIVE_SUITE, "Luxury suite", 2, 1, BigDecimal.valueOf(400.0));
        roomType.setId(50L);

        deal = new MysteryDeal(roomType, "Secret 5-Star Splendor in Bandra", "Arabian sea views", 40, BigDecimal.valueOf(240.0),
                LocalDate.now(), LocalDate.now().plusDays(30));
        deal.setId(200L);
    }

    @Test
    @DisplayName("Create booking successfully acquires pessimistic hold and masks secret hotel identity")
    void createBooking_success_pessimisticHoldAndIdentityMasked() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = checkIn.plusDays(3); // 3 nights

        CreateBookingRequest request = new CreateBookingRequest(
                null,
                200L,
                checkIn,
                checkOut,
                1,
                2,
                0,
                "Alex Morgan",
                "traveler@example.com",
                "+919876543210",
                "High floor requested"
        );

        when(userRepository.findById(10L)).thenReturn(Optional.of(traveler));
        when(mysteryDealRepository.findById(200L)).thenReturn(Optional.of(deal));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request, 10L);

        // Verify inventory service was called with pessimistic lock
        verify(inventoryService).reserveInventoryWithLock(eq(50L), eq(checkIn), eq(checkOut), eq(1));

        assertThat(response.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
        assertThat(response.stayNights()).isEqualTo(3);
        assertThat(response.nightlyRate()).isEqualByComparingTo(BigDecimal.valueOf(240.0));
        assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.valueOf(720.0)); // 240 * 3
        assertThat(response.secondsRemaining()).isGreaterThan(0);

        // STRICT IDENTITY MASKING GUARANTEES:
        assertThat(response.identityRevealed()).isFalse();
        assertThat(response.hotelName()).isEqualTo("Confidential 5-Star Hotel Partner");
        assertThat(response.hotelAddress()).contains("revealed upon booking confirmation");
        assertThat(response.hotelPhone()).isNull();
        assertThat(response.hotelEmail()).isNull();
    }

    @Test
    @DisplayName("Confirm booking transitions status to CONFIRMED and unlocks secret hotel identity")
    void confirmBooking_success_unlocksHotelIdentity() {
        Booking booking = new Booking(
                "MS-TEST1234",
                traveler,
                hotel,
                roomType,
                deal,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                1, 2, 0,
                "Alex Morgan", "traveler@example.com", "+919876543210",
                BigDecimal.valueOf(240.0), BigDecimal.valueOf(480.0),
                Instant.now().plus(15, ChronoUnit.MINUTES),
                null
        );

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.confirmBooking(1L, 10L, false);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.identityRevealed()).isTrue();

        // REVEALED CREDENTIALS:
        assertThat(response.hotelName()).isEqualTo("Secret Taj Grand");
        assertThat(response.hotelAddress()).isEqualTo("Bandra West, Mumbai");
        assertThat(response.hotelPhone()).isEqualTo("+912266681234");
        assertThat(response.hotelEmail()).isEqualTo("concierge@taj.com");
    }

    @Test
    @DisplayName("Cancel booking releases held inventory and sets status to CANCELLED")
    void cancelBooking_success_releasesInventory() {
        Booking booking = new Booking(
                "MS-TEST1234",
                traveler,
                hotel,
                roomType,
                deal,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                1, 2, 0,
                "Alex Morgan", "traveler@example.com", "+919876543210",
                BigDecimal.valueOf(240.0), BigDecimal.valueOf(480.0),
                Instant.now().plus(15, ChronoUnit.MINUTES),
                null
        );

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(1L, 10L, false);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        verify(inventoryService).releaseInventory(eq(50L), eq(booking.getCheckInDate()), eq(booking.getCheckOutDate()), eq(1));
    }

    @Test
    @DisplayName("Expire pending bookings sweeps expired holds and restores inventory")
    void expirePendingBookings_success() {
        Booking expiredHold = new Booking(
                "MS-EXPIRED",
                traveler,
                hotel,
                roomType,
                deal,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                2, 2, 0,
                "Alex Morgan", "traveler@example.com", "+919876543210",
                BigDecimal.valueOf(240.0), BigDecimal.valueOf(960.0),
                Instant.now().minus(5, ChronoUnit.MINUTES), // Expired 5 mins ago
                null
        );

        when(bookingRepository.findByStatusAndExpiresAtBefore(eq(BookingStatus.PENDING_PAYMENT), any(Instant.class)))
                .thenReturn(List.of(expiredHold));

        int processed = bookingService.expirePendingBookings();

        assertThat(processed).isEqualTo(1);
        assertThat(expiredHold.getStatus()).isEqualTo(BookingStatus.EXPIRED);
        verify(inventoryService).releaseInventory(eq(50L), eq(expiredHold.getCheckInDate()), eq(expiredHold.getCheckOutDate()), eq(2));
    }
}
