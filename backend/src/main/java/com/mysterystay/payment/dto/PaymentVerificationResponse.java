package com.mysterystay.payment.dto;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.payment.model.PaymentStatus;

public record PaymentVerificationResponse(
        String paymentReference,
        Long bookingId,
        String razorpayOrderId,
        String razorpayPaymentId,
        PaymentStatus status,
        boolean signatureValid,
        boolean bookingConfirmed,
        String message,
        BookingResponse booking
) {}
