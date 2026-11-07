package com.mysterystay.booking;

import com.mysterystay.booking.dto.CreateBookingRequest;
import com.mysterystay.booking.repository.BookingRepository;
import com.mysterystay.booking.service.BookingService;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.dto.SeedInventoryRequest;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomInventory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomInventoryRepository;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.inventory.service.InventoryService;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Concurrency Stress Test:
 * Proves that Pessimistic Row Locking (@Lock(LockModeType.PESSIMISTIC_WRITE))
 * strictly prevents race conditions and double-booking under extreme concurrent load.
 */
@SpringBootTest
@ActiveProfiles("test")
class BookingConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomInventoryRepository roomInventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    private Long roomTypeId;
    private List<User> testTravelers;
    private final LocalDate stayDate = LocalDate.now().plusDays(5);

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        roomInventoryRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        userRepository.deleteAll();

        User manager = userRepository.save(new User(
                "conc.manager@mysterystay.com", "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                "Manager", null, UserRole.ROLE_HOTEL_MANAGER
        ));

        Hotel hotel = hotelRepository.save(new Hotel(
                manager, "Grand Azure", "Azure", 5, "100 Beach Rd", "Goa", "Vagator", "403509",
                BigDecimal.ZERO, BigDecimal.ZERO, "+918321234567", "goa@azure.com"
        ));
        hotel.setVerified(true);
        hotel = hotelRepository.save(hotel);

        RoomType rt = roomTypeRepository.save(new RoomType(
                hotel, "Signature Villa", RoomCategory.VILLA, "Ultra luxury villa", 4, 2, BigDecimal.valueOf(500.0)
        ));
        roomTypeId = rt.getId();

        // Seed EXACTLY 1 room for the stay date
        inventoryService.seedInventory(
                hotel.getId(),
                rt.getId(),
                new SeedInventoryRequest(stayDate, stayDate.plusDays(1), 1, null),
                manager.getId(),
                false
        );

        // Pre-create 10 distinct travelers to simulate real simultaneous users
        testTravelers = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            User traveler = userRepository.save(new User(
                    "traveler" + i + "@concurrency.com",
                    "$2a$12$wrgTWw2Cwr7n2kGAFnq3HeBHH/YBUBsp3/rB5mSarAZS5hj.jS2Qe",
                    "Traveler " + i,
                    "+91980000000" + i,
                    UserRole.ROLE_CUSTOMER
            ));
            testTravelers.add(traveler);
        }
    }

    @Test
    @DisplayName("10 concurrent threads compete for 1 remaining room -> Exactly 1 succeeds, 9 fail with 409 Conflict")
    void concurrentBookingAttempts_exactlyOneSucceeds_zeroDoubleBooking() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger otherErrors = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final User traveler = testTravelers.get(i);
            executor.submit(() -> {
                try {
                    startLatch.await(); // Synchronize all 10 threads to release at the exact same instant

                    CreateBookingRequest request = new CreateBookingRequest(
                            roomTypeId,
                            null,
                            stayDate,
                            stayDate.plusDays(1),
                            1,
                            2,
                            0,
                            traveler.getFullName(),
                            traveler.getEmail(),
                            traveler.getPhone(),
                            "Concurrency test"
                    );

                    bookingService.createBooking(request, traveler.getId());
                    successCount.incrementAndGet();
                } catch (AppException ex) {
                    if (ex.getStatus().value() == 409) {
                        conflictCount.incrementAndGet();
                    } else {
                        otherErrors.incrementAndGet();
                    }
                } catch (Exception ex) {
                    otherErrors.incrementAndGet();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Fire all threads simultaneously
        startLatch.countDown();
        boolean finished = finishLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(finished).isTrue();

        // STRICT CONCURRENCY PROOF:
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(9);
        assertThat(otherErrors.get()).isEqualTo(0);

        // Verify database inventory state: exactly 0 available, exactly 1 booked
        RoomInventory inventory = roomInventoryRepository.findByRoomTypeIdAndInventoryDate(roomTypeId, stayDate)
                .orElseThrow();
        assertThat(inventory.getAvailableRooms()).isEqualTo(0);
        assertThat(inventory.getBookedRooms()).isEqualTo(1);
        assertThat(inventory.getTotalRooms()).isEqualTo(1);

        // Verify only 1 booking record in the database
        assertThat(bookingRepository.count()).isEqualTo(1);
    }
}
