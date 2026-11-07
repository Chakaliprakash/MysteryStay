package com.mysterystay.payment.dto;

import jakarta.validation.constraints.NotNull;

public record CreateUpiPaymentOrderRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId
) {}
