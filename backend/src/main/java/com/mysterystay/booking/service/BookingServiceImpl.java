package com.mysterystay.booking.service;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.dto.CreateBookingRequest;
import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.model.BookingStatus;
import com.mysterystay.booking.repository.BookingRepository;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.inventory.service.InventoryService;
import com.mysterystay.user.model.User;
import com.mysterystay.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);
    private static final int RESERVATION_HOLD_MINUTES = 15;

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final MysteryDealRepository mysteryDealRepository;
    private final InventoryService inventoryService;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            RoomTypeRepository roomTypeRepository,
            MysteryDealRepository mysteryDealRepository,
            InventoryService inventoryService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.mysteryDealRepository = mysteryDealRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        if (!request.checkOutDate().isAfter(request.checkInDate())) {
            throw new AppException("Check-out date must be strictly after check-in date", HttpStatus.BAD_REQUEST, "INVALID_STAY_DATES");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found with ID: " + userId, HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        RoomType roomType;
        MysteryDeal mysteryDeal = null;
        BigDecimal nightlyRate;
        Hotel hotel;

        if (request.mysteryDealId() != null) {
            mysteryDeal = mysteryDealRepository.findById(request.mysteryDealId())
                    .orElseThrow(() -> new AppException("Mystery deal not found with ID: " + request.mysteryDealId(), HttpStatus.NOT_FOUND, "DEAL_NOT_FOUND"));

            if (!mysteryDeal.isActive()) {
                throw new AppException("This mystery deal is no longer active", HttpStatus.BAD_REQUEST, "DEAL_INACTIVE");
            }
            if (request.checkInDate().isBefore(mysteryDeal.getValidFrom()) || request.checkOutDate().isAfter(mysteryDeal.getValidTo())) {
                throw new AppException("Booking dates fall outside the validity range of this mystery deal", HttpStatus.BAD_REQUEST, "DEAL_DATES_INVALID");
            }

            roomType = mysteryDeal.getRoomType();
            hotel = roomType.getHotel();
            nightlyRate = mysteryDeal.getMysteryPrice();
        } else if (request.roomTypeId() != null) {
            roomType = roomTypeRepository.findById(request.roomTypeId())
                    .orElseThrow(() -> new AppException("Room type not found with ID: " + request.roomTypeId(), HttpStatus.NOT_FOUND, "ROOM_TYPE_NOT_FOUND"));

            hotel = roomType.getHotel();
            nightlyRate = roomType.getBasePrice();
        } else {
            throw new AppException("Either roomTypeId or mysteryDealId must be provided", HttpStatus.BAD_REQUEST, "MISSING_BOOKING_TARGET");
        }

        // ATOMIC CRITICAL SECTION:
        // Acquires row locks on daily inventory with PESSIMISTIC_WRITE (SELECT ... FOR UPDATE)
        // Deducts available rooms. If capacity is insufficient, throws 409 Conflict.
        inventoryService.reserveInventoryWithLock(roomType.getId(), request.checkInDate(), request.checkOutDate(), request.roomCount());

        long stayNights = ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
        BigDecimal totalAmount = nightlyRate.multiply(BigDecimal.valueOf(stayNights * request.roomCount()));

        String reference = "MS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant expiresAt = Instant.now().plus(RESERVATION_HOLD_MINUTES, ChronoUnit.MINUTES);

        Booking booking = new Booking(
                reference,
                user,
                hotel,
                roomType,
                mysteryDeal,
                request.checkInDate(),
                request.checkOutDate(),
                request.roomCount(),
                request.adultCount(),
                request.childCount(),
                request.guestName(),
                request.guestEmail(),
                request.guestPhone(),
                nightlyRate,
                totalAmount,
                expiresAt,
                request.specialRequests()
        );

        booking = bookingRepository.save(booking);
        log.info("Booking created in PENDING_PAYMENT [Ref: {}, User: {}, Total: ${}] with 15-min hold",
                reference, user.getEmail(), totalAmount);

        return BookingResponse.from(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByReference(String bookingReference, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new AppException("Booking not found with reference: " + bookingReference, HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        validateBookingAccess(booking, userId, isAdmin);
        return BookingResponse.from(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse confirmBooking(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException("Booking not found with ID: " + bookingId, HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        validateBookingAccess(booking, userId, isAdmin);

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException("Only bookings in PENDING_PAYMENT status can be confirmed", HttpStatus.BAD_REQUEST, "INVALID_BOOKING_STATUS");
        }
        if (booking.isExpired()) {
            throw new AppException("This booking hold has expired. Please initiate a new reservation.", HttpStatus.BAD_REQUEST, "BOOKING_EXPIRED");
        }

        booking.confirm();
        booking = bookingRepository.save(booking);
        log.info("Booking CONFIRMED [Ref: {}]. Real hotel identity revealed: {}",
                booking.getBookingReference(), booking.getHotel().getName());

        return BookingResponse.from(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException("Booking not found with ID: " + bookingId, HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        validateBookingAccess(booking, userId, isAdmin);

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            throw new AppException("Booking is already terminated: " + booking.getStatus(), HttpStatus.BAD_REQUEST, "ALREADY_TERMINATED");
        }

        // Release locked inventory back to the room ledger
        inventoryService.releaseInventory(
                booking.getRoomType().getId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getRoomCount()
        );

        booking.cancel();
        booking = bookingRepository.save(booking);
        log.info("Booking CANCELLED [Ref: {}]. Restored {} rooms to inventory.",
                booking.getBookingReference(), booking.getRoomCount());

        return BookingResponse.from(booking);
    }

    @Override
    @Transactional
    public int expirePendingBookings() {
        List<Booking> expiredBookings = bookingRepository.findByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT,
                Instant.now()
        );

        if (expiredBookings.isEmpty()) {
            return 0;
        }

        int count = 0;
        for (Booking b : expiredBookings) {
            try {
                inventoryService.releaseInventory(
                        b.getRoomType().getId(),
                        b.getCheckInDate(),
                        b.getCheckOutDate(),
                        b.getRoomCount()
                );
                b.expire();
                bookingRepository.save(b);
                count++;
                log.info("Auto-expired booking hold [Ref: {}]. Released inventory.", b.getBookingReference());
            } catch (Exception ex) {
                log.error("Failed to release inventory for expired booking ID: {}", b.getId(), ex);
            }
        }

        return count;
    }

    private void validateBookingAccess(Booking booking, Long userId, boolean isAdmin) {
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new AppException("You do not have permission to view or modify this booking", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }
    }
}
