package com.mysterystay.payment.service;

import com.mysterystay.payment.dto.CreatePaymentOrderRequest;
import com.mysterystay.payment.dto.PaymentOrderResponse;
import com.mysterystay.payment.dto.PaymentVerificationResponse;
import com.mysterystay.payment.dto.RazorpayWebhookPayload;
import com.mysterystay.payment.dto.VerifyPaymentRequest;

public interface PaymentService {

    PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request, Long userId);

    PaymentVerificationResponse verifyPayment(VerifyPaymentRequest request, Long userId, boolean isAdmin);

    PaymentVerificationResponse handleWebhook(RazorpayWebhookPayload payload, String signatureHeader);

    PaymentOrderResponse getPaymentByBookingId(Long bookingId, Long userId, boolean isAdmin);
}
