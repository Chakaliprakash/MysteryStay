package com.mysterystay.payment.dto;

import com.mysterystay.payment.model.PaymentStatus;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        String paymentReference,
        Long bookingId,
        String razorpayOrderId,
        BigDecimal amount,
        String currency,
        String razorpayKeyId,
        PaymentStatus status,
        String bookingReference
) {}
