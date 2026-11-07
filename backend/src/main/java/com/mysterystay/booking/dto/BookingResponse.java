package com.mysterystay.booking.dto;

import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.model.BookingStatus;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomType;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Booking DTO enforcing the Identity Masking Rule:
 * Real hotel identity (name, exact street address, and contact coordinates)
 * is ONLY revealed when status is CONFIRMED and identityRevealed is true.
 */
public record BookingResponse(
        Long bookingId,
        String bookingReference,
        BookingStatus status,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int stayNights,
        int roomCount,
        int adultCount,
        int childCount,
        String guestName,
        String guestEmail,
        String guestPhone,
        BigDecimal nightlyRate,
        BigDecimal totalAmount,
        Instant expiresAt,
        long secondsRemaining,
        boolean identityRevealed,

        // Conditional Hotel Identity attributes
        String hotelName,
        String hotelAddress,
        String hotelPhone,
        String hotelEmail,

        // Public clue attributes always visible
        String city,
        String zoneArea,
        int starRating,
        String roomCategory,
        String roomTypeName,
        String specialRequests
) {
    public static BookingResponse from(Booking booking) {
        Hotel h = booking.getHotel();
        RoomType rt = booking.getRoomType();
        int nights = (int) ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        long remaining = Math.max(0, Duration.between(Instant.now(), booking.getExpiresAt()).getSeconds());

        boolean revealed = booking.isIdentityRevealed() && booking.getStatus() == BookingStatus.CONFIRMED;

        String name = revealed ? h.getName() : "Confidential 5-Star Hotel Partner";
        String address = revealed ? h.getAddress() : "Exact street address revealed upon booking confirmation";
        String phone = revealed ? h.getPhone() : null;
        String email = revealed ? h.getEmail() : null;

        return new BookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getStatus(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                nights,
                booking.getRoomCount(),
                booking.getAdultCount(),
                booking.getChildCount(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getGuestPhone(),
                booking.getNightlyRate(),
                booking.getTotalAmount(),
                booking.getExpiresAt(),
                remaining,
                revealed,
                name,
                address,
                phone,
                email,
                h.getCity(),
                h.getZoneArea(),
                h.getStarRating(),
                rt.getCategory().name(),
                rt.getName(),
                booking.getSpecialRequests()
        );
    }
}
