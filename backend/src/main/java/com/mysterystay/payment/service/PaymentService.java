package com.mysterystay.payment.service;

import com.mysterystay.payment.dto.*;

public interface PaymentService {

    PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request, Long userId);

    PaymentVerificationResponse verifyPayment(VerifyPaymentRequest request, Long userId, boolean isAdmin);

    PaymentVerificationResponse handleWebhook(RazorpayWebhookPayload payload, String signatureHeader);

    PaymentOrderResponse getPaymentByBookingId(Long bookingId, Long userId, boolean isAdmin);

    UpiPaymentOrderResponse createUpiPaymentOrder(CreateUpiPaymentOrderRequest request, Long userId);

    PaymentVerificationResponse verifyUpiPayment(VerifyUpiPaymentRequest request, Long userId, boolean isAdmin);

    PaymentOrderResponse getPaymentByReference(String paymentReference, Long userId, boolean isAdmin);
}
