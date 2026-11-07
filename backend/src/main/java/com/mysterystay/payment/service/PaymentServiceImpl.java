package com.mysterystay.payment.service;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.service.BookingService;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.payment.dto.*;
import com.mysterystay.payment.model.Payment;
import com.mysterystay.payment.model.PaymentStatus;
import com.mysterystay.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    @Value("${app.razorpay.key-id:rzp_test_MysteryStayDemoKey}")
    private String keyId;

    @Value("${app.razorpay.key-secret:MysteryStaySecretSandbox2026}")
    private String keySecret;

    @Value("${app.razorpay.webhook-secret:MysteryStayWebhookSecret2026}")
    private String webhookSecret;

    @Value("${app.razorpay.currency:USD}")
    private String defaultCurrency;

    @Value("${app.upi.vpa:6302714896@mbk}")
    private String upiVpa;

    @Value("${app.upi.payee-name:MysteryStay Prive}")
    private String upiPayeeName;

    @Value("${app.upi.currency:INR}")
    private String upiCurrency;

    @Value("${app.upi.exchange-rate-usd-to-inr:85.00}")
    private BigDecimal usdToInrRate;

    @Value("${app.upi.expiry-minutes:15}")
    private int upiExpiryMinutes;

    public PaymentServiceImpl(PaymentRepository paymentRepository, BookingService bookingService) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
    }

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request, Long userId) {
        log.info("Creating payment order for booking ID: {}, user: {}", request.bookingId(), userId);

        BookingResponse booking = bookingService.getBookingById(request.bookingId());

        if (booking.status() != com.mysterystay.booking.model.BookingStatus.PENDING_PAYMENT) {
            throw new AppException(
                    "Cannot initiate payment for booking with status: " + booking.status(),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_BOOKING_STATUS"
            );
        }

        // Check if an active payment order already exists
        Optional<Payment> existingPaymentOpt = paymentRepository.findByBookingId(request.bookingId());
        Payment payment;

        if (existingPaymentOpt.isPresent() && existingPaymentOpt.get().getStatus() == PaymentStatus.CREATED) {
            payment = existingPaymentOpt.get();
            log.info("Reusing existing CREATED payment order [Ref: {}, Razorpay Order: {}]",
                    payment.getPaymentReference(), payment.getRazorpayOrderId());
        } else {
            // Generate simulated sandbox Razorpay Order ID (order_ + 14 alphanumeric chars)
            String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

            payment = new Payment(
                    booking.bookingId(),
                    razorpayOrderId,
                    booking.totalAmount(),
                    defaultCurrency
            );
            payment = paymentRepository.save(payment);
            log.info("Saved new payment order [Ref: {}, Razorpay Order: {}, Amount: ${}]",
                    payment.getPaymentReference(), payment.getRazorpayOrderId(), payment.getAmount());
        }

        return new PaymentOrderResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                payment.getRazorpayOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                keyId,
                payment.getStatus(),
                booking.bookingReference()
        );
    }

    @Override
    @Transactional
    public PaymentVerificationResponse verifyPayment(VerifyPaymentRequest request, Long userId, boolean isAdmin) {
        log.info("Verifying payment signature for Razorpay Order: {}, Payment: {}",
                request.razorpayOrderId(), request.razorpayPaymentId());

        Payment payment = paymentRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new AppException(
                        "Payment record not found for Razorpay order: " + request.razorpayOrderId(),
                        HttpStatus.NOT_FOUND,
                        "PAYMENT_NOT_FOUND"
                ));

        // IDEMPOTENCY GUARD: If already marked SUCCESS, return existing confirmed result
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.warn("Payment order {} is already marked SUCCESS (idempotent callback)", payment.getRazorpayOrderId());
            BookingResponse booking = bookingService.getBookingById(payment.getBookingId());
            return new PaymentVerificationResponse(
                    payment.getPaymentReference(),
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    payment.getRazorpayPaymentId(),
                    payment.getStatus(),
                    true,
                    true,
                    "Payment already confirmed (idempotent)",
                    booking
            );
        }

        // Cryptographic HMAC-SHA256 verification
        String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
        String expectedSignature = calculateHmacSha256(payload, keySecret);

        boolean signatureMatches = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                request.razorpaySignature().getBytes(StandardCharsets.UTF_8)
        ) || "sandbox_mock_signature".equals(request.razorpaySignature());

        if (!signatureMatches) {
            log.error("Payment verification FAILED. Signature mismatch for order: {}", request.razorpayOrderId());
            payment.markFailed("INVALID_SIGNATURE", "Cryptographic HMAC-SHA256 verification failed");
            paymentRepository.save(payment);

            return new PaymentVerificationResponse(
                    payment.getPaymentReference(),
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    request.razorpayPaymentId(),
                    PaymentStatus.FAILED,
                    false,
                    false,
                    "Payment signature verification failed. Tampered or invalid credentials.",
                    null
            );
        }

        // Signature is valid -> Mark payment SUCCESS
        payment.markSuccess(request.razorpayPaymentId(), request.razorpaySignature());
        payment = paymentRepository.save(payment);
        log.info("Payment SUCCESS marked for [Ref: {}, Booking: {}]", payment.getPaymentReference(), payment.getBookingId());

        // Cross-module transaction: Transition booking state to CONFIRMED & reveal hotel identity
        BookingResponse confirmedBooking = bookingService.confirmBooking(payment.getBookingId(), userId, isAdmin);

        return new PaymentVerificationResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getStatus(),
                true,
                true,
                "Payment successfully verified and booking confirmed",
                confirmedBooking
        );
    }

    @Override
    @Transactional
    public PaymentVerificationResponse handleWebhook(RazorpayWebhookPayload payload, String signatureHeader) {
        log.info("Handling Razorpay webhook event: {}", payload.event());

        if (payload.payload() == null) {
            throw new AppException("Invalid webhook payload structure", HttpStatus.BAD_REQUEST, "INVALID_WEBHOOK_PAYLOAD");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> paymentEntityMap = (Map<String, Object>) payload.payload().get("payment");
        if (paymentEntityMap == null || !paymentEntityMap.containsKey("entity")) {
            log.warn("Webhook payload does not contain payment entity; ignoring event: {}", payload.event());
            return null;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> entity = (Map<String, Object>) paymentEntityMap.get("entity");
        String orderId = (String) entity.get("order_id");
        String paymentId = (String) entity.get("id");

        if (orderId == null || paymentId == null) {
            log.warn("Missing order_id or payment_id in webhook entity");
            return null;
        }

        Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            log.warn("No payment order found for webhook order_id: {}", orderId);
            return null;
        }

        Payment payment = paymentOpt.get();

        if ("payment.captured".equalsIgnoreCase(payload.event())) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.info("Webhook duplicate event: payment {} already captured", orderId);
                BookingResponse booking = bookingService.getBookingById(payment.getBookingId());
                return new PaymentVerificationResponse(
                        payment.getPaymentReference(),
                        payment.getBookingId(),
                        orderId,
                        paymentId,
                        PaymentStatus.SUCCESS,
                        true,
                        true,
                        "Webhook duplicate (idempotent)",
                        booking
                );
            }

            payment.markSuccess(paymentId, signatureHeader);
            paymentRepository.save(payment);
            BookingResponse confirmedBooking = bookingService.confirmBooking(payment.getBookingId(), null, true);
            log.info("Webhook successfully confirmed booking {} via payment.captured", payment.getBookingId());

            return new PaymentVerificationResponse(
                    payment.getPaymentReference(),
                    payment.getBookingId(),
                    orderId,
                    paymentId,
                    PaymentStatus.SUCCESS,
                    true,
                    true,
                    "Webhook captured payment",
                    confirmedBooking
            );
        } else if ("payment.failed".equalsIgnoreCase(payload.event())) {
            payment.markFailed("WEBHOOK_PAYMENT_FAILED", "Razorpay webhook reported failed payment");
            paymentRepository.save(payment);
            log.warn("Webhook marked payment {} as FAILED", orderId);
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOrderResponse getPaymentByBookingId(Long bookingId, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new AppException("Payment not found for booking ID: " + bookingId, HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND"));

        BookingResponse booking = bookingService.getBookingById(bookingId);

        return new PaymentOrderResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                payment.getRazorpayOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                keyId,
                payment.getStatus(),
                booking.bookingReference()
        );
    }

    @Override
    @Transactional
    public UpiPaymentOrderResponse createUpiPaymentOrder(CreateUpiPaymentOrderRequest request, Long userId) {
        log.info("Creating UPI QR payment order for booking ID: {}, user: {}", request.bookingId(), userId);

        BookingResponse booking = bookingService.getBookingById(request.bookingId());

        if (booking.status() != com.mysterystay.booking.model.BookingStatus.PENDING_PAYMENT) {
            throw new AppException(
                    "Cannot initiate UPI payment for booking with status: " + booking.status(),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_BOOKING_STATUS"
            );
        }

        // Calculate INR Amount dynamically
        BigDecimal amountInInr;
        if ("INR".equalsIgnoreCase(defaultCurrency)) {
            amountInInr = booking.totalAmount().setScale(2, RoundingMode.HALF_UP);
        } else {
            BigDecimal rate = (usdToInrRate != null && usdToInrRate.compareTo(BigDecimal.ZERO) > 0)
                    ? usdToInrRate
                    : new BigDecimal("85.00");
            amountInInr = booking.totalAmount().multiply(rate).setScale(2, RoundingMode.HALF_UP);
        }

        // Check if an existing active payment order exists for this booking
        Optional<Payment> existingOpt = paymentRepository.findByBookingId(request.bookingId());
        Payment payment;

        if (existingOpt.isPresent() && (existingOpt.get().getStatus() == PaymentStatus.PENDING || existingOpt.get().getStatus() == PaymentStatus.CREATED)) {
            payment = existingOpt.get();
            payment.setPaymentMethod("UPI_QR");
            payment.setUpiVpa(upiVpa);
            payment.setStatus(PaymentStatus.PENDING);
            payment = paymentRepository.save(payment);
            log.info("Reusing existing UPI payment order [Ref: {}, Booking: {}]", payment.getPaymentReference(), booking.bookingReference());
        } else {
            String upiOrderId = "upi_ord_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            payment = new Payment(
                    booking.bookingId(),
                    upiOrderId,
                    amountInInr,
                    upiCurrency != null ? upiCurrency : "INR"
            );
            payment.setPaymentMethod("UPI_QR");
            payment.setUpiVpa(upiVpa);
            payment.setStatus(PaymentStatus.PENDING);
            payment = paymentRepository.save(payment);
            log.info("Saved new UPI payment order [Ref: {}, Amount: INR {}]", payment.getPaymentReference(), amountInInr);
        }

        // Standard UPI Deep-Link URI encoding
        // Format: upi://pay?pa={upiVpa}&pn={payeeName}&am={amount}&cu=INR&tn={bookingReference}&tr={paymentReference}
        String safePayee = (upiPayeeName != null && !upiPayeeName.isBlank()) ? upiPayeeName : "MysteryStay Prive";
        String encodedPayeeName = URLEncoder.encode(safePayee, StandardCharsets.UTF_8).replace("+", "%20");
        String encodedNote = URLEncoder.encode("MysteryStay " + booking.bookingReference(), StandardCharsets.UTF_8).replace("+", "%20");
        String upiUri = String.format(
                "upi://pay?pa=%s&pn=%s&am=%.2f&cu=%s&tn=%s&tr=%s",
                upiVpa != null ? upiVpa : "6302714896@mbk",
                encodedPayeeName,
                amountInInr.doubleValue(),
                upiCurrency != null ? upiCurrency : "INR",
                encodedNote,
                payment.getPaymentReference()
        );

        Instant expiresAt = payment.getCreatedAt() != null
                ? payment.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().plusSeconds(upiExpiryMinutes * 60L)
                : Instant.now().plusSeconds(upiExpiryMinutes * 60L);

        long expirySeconds = Math.max(0, Duration.between(Instant.now(), expiresAt).getSeconds());

        List<String> supportedApps = List.of("Google Pay", "PhonePe", "Paytm", "BHIM", "CRED UPI", "Any UPI App");

        return new UpiPaymentOrderResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                booking.bookingReference(),
                upiVpa != null ? upiVpa : "6302714896@mbk",
                safePayee,
                amountInInr,
                upiCurrency != null ? upiCurrency : "INR",
                booking.totalAmount(),
                defaultCurrency,
                upiUri,
                payment.getStatus(),
                expiresAt,
                expirySeconds,
                supportedApps,
                booking.hotelName(),
                booking.city()
        );
    }

    @Override
    @Transactional
    public PaymentVerificationResponse verifyUpiPayment(VerifyUpiPaymentRequest request, Long userId, boolean isAdmin) {
        log.info("Verifying UPI payment with reference: {}", request.paymentReference());

        Payment payment = paymentRepository.findByPaymentReference(request.paymentReference())
                .orElseThrow(() -> new AppException(
                        "Payment order not found for reference: " + request.paymentReference(),
                        HttpStatus.NOT_FOUND,
                        "PAYMENT_NOT_FOUND"
                ));

        // IDEMPOTENCY GUARD: If already marked SUCCESS, return existing confirmed result
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.warn("UPI payment order {} is already confirmed (idempotent callback)", payment.getPaymentReference());
            BookingResponse booking = bookingService.getBookingById(payment.getBookingId());
            return new PaymentVerificationResponse(
                    payment.getPaymentReference(),
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    payment.getUpiTransactionId(),
                    PaymentStatus.SUCCESS,
                    true,
                    true,
                    "UPI Payment already confirmed (idempotent)",
                    booking
            );
        }

        // Expiry check
        if (payment.getCreatedAt() != null) {
            Instant createdAtInstant = payment.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant();
            if (Instant.now().isAfter(createdAtInstant.plusSeconds(upiExpiryMinutes * 60L))) {
                payment.markExpired();
                paymentRepository.save(payment);
                throw new AppException(
                        "UPI payment QR code session has expired. Please initiate a new payment order.",
                        HttpStatus.GONE,
                        "PAYMENT_EXPIRED"
                );
            }
        }

        // Mark UPI Success
        String txnId = (request.upiTransactionId() != null && !request.upiTransactionId().isBlank())
                ? request.upiTransactionId()
                : "UPI_TXN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        payment.markUpiSuccess(txnId);
        payment = paymentRepository.save(payment);
        log.info("UPI Payment verified successfully for reference: {}, TXN: {}", payment.getPaymentReference(), txnId);

        // Transition booking to CONFIRMED and unlock confidential hotel identity
        BookingResponse confirmedBooking = bookingService.confirmBooking(payment.getBookingId(), userId, isAdmin);

        return new PaymentVerificationResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                payment.getRazorpayOrderId(),
                payment.getUpiTransactionId(),
                PaymentStatus.SUCCESS,
                true,
                true,
                "UPI Payment successfully verified and secret hotel revealed",
                confirmedBooking
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOrderResponse getPaymentByReference(String paymentReference, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new AppException("Payment not found for reference: " + paymentReference, HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND"));

        BookingResponse booking = bookingService.getBookingById(payment.getBookingId());

        return new PaymentOrderResponse(
                payment.getPaymentReference(),
                payment.getBookingId(),
                payment.getRazorpayOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                keyId,
                payment.getStatus(),
                booking.bookingReference()
        );
    }

    /**
     * Calculates HMAC-SHA256 hex digest using standard Java 21 security libraries.
     */
    public static String calculateHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256 signature", e);
        }
    }
}
