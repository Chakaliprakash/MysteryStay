package com.mysterystay.payment.dto;

import com.mysterystay.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record UpiPaymentOrderResponse(
        String paymentReference,
        Long bookingId,
        String bookingReference,
        String upiId,
        String payeeName,
        BigDecimal amountInInr,
        String currency,
        BigDecimal originalAmount,
        String originalCurrency,
        String upiUri,
        PaymentStatus status,
        Instant expiresAt,
        Long expirySeconds,
        List<String> supportedApps,
        String hotelMysteryTitle,
        String city
) {}
