package com.mysterystay.payment.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.payment.dto.*;
import com.mysterystay.payment.service.PaymentService;
import com.mysterystay.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Creates a new Razorpay sandbox order for an existing PENDING_PAYMENT booking.
     */
    @PostMapping("/create-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success(response, "Razorpay payment order initialized"), HttpStatus.CREATED);
    }

    /**
     * Verifies cryptographic HMAC-SHA256 signature from Razorpay checkout.
     * Transitions booking to CONFIRMED and unlocks confidential hotel identity.
     */
    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentVerificationResponse response = paymentService.verifyPayment(request, principal.getId(), isAdmin);

        if (!response.signatureValid()) {
            return new ResponseEntity<>(ApiResponse.failure("Signature verification failed"), HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(ApiResponse.success(response, "Payment verified and booking confirmed"));
    }

    /**
     * Webhook endpoint: Handles asynchronous payment events from Razorpay.
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> handleWebhook(
            @RequestBody RazorpayWebhookPayload payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader
    ) {
        PaymentVerificationResponse response = paymentService.handleWebhook(payload, signatureHeader);
        return ResponseEntity.ok(ApiResponse.success(response, "Webhook event processed"));
    }

    /**
     * Fetches payment details for a specific booking.
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> getPaymentByBookingId(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentOrderResponse response = paymentService.getPaymentByBookingId(bookingId, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment details retrieved successfully"));
    }

    /**
     * Creates a new UPI QR code payment order with dynamic amount, note, and payee VPA.
     */
    @PostMapping("/upi/create-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UpiPaymentOrderResponse>> createUpiPaymentOrder(
            @Valid @RequestBody CreateUpiPaymentOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UpiPaymentOrderResponse response = paymentService.createUpiPaymentOrder(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success(response, "UPI payment QR order initialized"), HttpStatus.CREATED);
    }

    /**
     * Verifies UPI payment server-side and confirms booking to reveal secret hotel identity.
     */
    @PostMapping("/upi/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> verifyUpiPayment(
            @Valid @RequestBody VerifyUpiPaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentVerificationResponse response = paymentService.verifyUpiPayment(request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "UPI payment verified and hotel unlocked"));
    }

    /**
     * Checks payment status by payment reference.
     */
    @GetMapping("/upi/status/{paymentReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> getUpiPaymentStatus(
            @PathVariable String paymentReference,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentOrderResponse response = paymentService.getPaymentByReference(paymentReference, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "UPI payment status retrieved"));
    }
}
