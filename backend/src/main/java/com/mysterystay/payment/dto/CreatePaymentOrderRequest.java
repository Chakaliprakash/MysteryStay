package com.mysterystay.payment.dto;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentOrderRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId
) {}
