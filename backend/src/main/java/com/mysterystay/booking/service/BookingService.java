package com.mysterystay.booking.service;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.dto.CreateBookingRequest;

import java.util.List;

public interface BookingService {

    /**
     * Creates a new booking reservation, atomically locks inventory across all stay dates,
     * sets a 15-minute expiration hold, and returns an identity-masked booking envelope.
     */
    BookingResponse createBooking(CreateBookingRequest request, Long userId);

    /**
     * Retrieves booking details by ID (internal module API).
     */
    BookingResponse getBookingById(Long bookingId);

    /**
     * Retrieves booking details by reference code.
     * Enforces ownership authorization (only the booking owner or admin can inspect).
     */
    BookingResponse getBookingByReference(String bookingReference, Long userId, boolean isAdmin);

    /**
     * Lists all bookings belonging to the authenticated traveler.
     */
    List<BookingResponse> getMyBookings(Long userId);

    /**
     * Confirms a booking reservation (post-payment verification).
     * Transitions status to CONFIRMED and unlocks the hotel's real identity.
     */
    BookingResponse confirmBooking(Long bookingId, Long userId, boolean isAdmin);

    /**
     * Cancels a booking and releases held inventory back to the room ledger.
     */
    BookingResponse cancelBooking(Long bookingId, Long userId, boolean isAdmin);

    /**
     * Background worker task: cancels expired holds and restores inventory.
     *
     * @return count of expired reservations processed
     */
    int expirePendingBookings();
}
