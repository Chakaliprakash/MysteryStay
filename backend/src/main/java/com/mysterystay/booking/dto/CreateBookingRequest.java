package com.mysterystay.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBookingRequest(
        Long roomTypeId,
        Long mysteryDealId,

        @NotNull(message = "Check-in date is required")
        LocalDate checkInDate,

        @NotNull(message = "Check-out date is required")
        LocalDate checkOutDate,

        @Min(value = 1, message = "At least 1 room is required")
        int roomCount,

        @Min(value = 1, message = "At least 1 adult is required")
        int adultCount,

        @Min(value = 0, message = "Child count cannot be negative")
        int childCount,

        @NotBlank(message = "Guest name is required")
        String guestName,

        @NotBlank(message = "Guest email is required")
        @Email(message = "Invalid guest email format")
        String guestEmail,

        @NotBlank(message = "Guest phone number is required")
        String guestPhone,

        String specialRequests
) {
    public CreateBookingRequest {
        if (roomCount <= 0) {
            roomCount = 1;
        }
        if (adultCount <= 0) {
            adultCount = 1;
        }
    }
}
