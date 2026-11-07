package com.mysterystay.payment;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.model.BookingStatus;
import com.mysterystay.booking.service.BookingService;
import com.mysterystay.common.exception.AppException;
import com.mysterystay.payment.dto.*;
import com.mysterystay.payment.model.Payment;
import com.mysterystay.payment.model.PaymentStatus;
import com.mysterystay.payment.repository.PaymentRepository;
import com.mysterystay.payment.service.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private final String testKeyId = "rzp_test_MysteryStayDemoKey";
    private final String testKeySecret = "MysteryStaySecretSandbox2026";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keyId", testKeyId);
        ReflectionTestUtils.setField(paymentService, "keySecret", testKeySecret);
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "MysteryStayWebhookSecret2026");
        ReflectionTestUtils.setField(paymentService, "defaultCurrency", "USD");
        ReflectionTestUtils.setField(paymentService, "upiVpa", "6302714896@mbk");
        ReflectionTestUtils.setField(paymentService, "upiPayeeName", "MysteryStay Prive");
        ReflectionTestUtils.setField(paymentService, "upiCurrency", "INR");
        ReflectionTestUtils.setField(paymentService, "usdToInrRate", new BigDecimal("85.00"));
        ReflectionTestUtils.setField(paymentService, "upiExpiryMinutes", 15);
    }

    private BookingResponse createMockBooking(Long id, BookingStatus status, BigDecimal total) {
        return new BookingResponse(
                id, "BK-ABC12345", status,
                LocalDate.now(), LocalDate.now().plusDays(2), 2, 1, 2, 0,
                "Alex Morgan", "alex@example.com", "+919876543210",
                new BigDecimal("200.00"), total,
                Instant.now().plusSeconds(900), 900L,
                status == BookingStatus.CONFIRMED,
                status == BookingStatus.CONFIRMED ? "The Grand Azure Palace" : "Confidential 5-Star Hotel",
                status == BookingStatus.CONFIRMED ? "42 MG Road, Bangalore" : "Exact address revealed upon confirmation",
                status == BookingStatus.CONFIRMED ? "+918023456789" : null,
                null,
                "Bangalore", "Indiranagar", 5, "EXECUTIVE_SUITE", "Executive Sea Suite", "Quiet room"
        );
    }

    @Test
    @DisplayName("createPaymentOrder: Successfully creates a new payment order for PENDING_PAYMENT booking")
    void createPaymentOrder_Success() {
        BookingResponse pendingBooking = createMockBooking(100L, BookingStatus.PENDING_PAYMENT, new BigDecimal("400.00"));

        when(bookingService.getBookingById(100L)).thenReturn(pendingBooking);
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentOrderResponse response = paymentService.createPaymentOrder(new CreatePaymentOrderRequest(100L), 1L);

        assertThat(response).isNotNull();
        assertThat(response.bookingId()).isEqualTo(100L);
        assertThat(response.amount()).isEqualTo(new BigDecimal("400.00"));
        assertThat(response.currency()).isEqualTo("USD");
        assertThat(response.razorpayOrderId()).startsWith("order_");
        assertThat(response.status()).isEqualTo(PaymentStatus.CREATED);

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("createPaymentOrder: Rejects order initiation if booking is not in PENDING_PAYMENT")
    void createPaymentOrder_InvalidStatus_ThrowsException() {
        BookingResponse confirmedBooking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("400.00"));

        when(bookingService.getBookingById(100L)).thenReturn(confirmedBooking);

        assertThatThrownBy(() -> paymentService.createPaymentOrder(new CreatePaymentOrderRequest(100L), 1L))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Cannot initiate payment for booking with status: CONFIRMED");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyPayment: Valid HMAC-SHA256 signature confirms booking and reveals identity")
    void verifyPayment_ValidSignature_ConfirmsBooking() {
        String orderId = "order_test12345678";
        String paymentId = "pay_test98765432";

        // Calculate expected HMAC-SHA256 signature
        String validSignature = PaymentServiceImpl.calculateHmacSha256(orderId + "|" + paymentId, testKeySecret);

        Payment payment = new Payment(100L, orderId, new BigDecimal("400.00"), "USD");
        BookingResponse confirmedBooking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("400.00"));

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingService.confirmBooking(100L, 1L, false)).thenReturn(confirmedBooking);

        VerifyPaymentRequest request = new VerifyPaymentRequest(orderId, paymentId, validSignature);
        PaymentVerificationResponse response = paymentService.verifyPayment(request, 1L, false);

        assertThat(response.signatureValid()).isTrue();
        assertThat(response.bookingConfirmed()).isTrue();
        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getRazorpayPaymentId()).isEqualTo(paymentId);
        assertThat(payment.getRazorpaySignature()).isEqualTo(validSignature);

        verify(bookingService).confirmBooking(100L, 1L, false);
    }

    @Test
    @DisplayName("verifyPayment: Tampered or invalid signature rejects verification and marks payment FAILED")
    void verifyPayment_InvalidSignature_FailsPayment() {
        String orderId = "order_test12345678";
        String paymentId = "pay_test98765432";
        String fakeSignature = "invalid_tampered_signature_12345";

        Payment payment = new Payment(100L, orderId, new BigDecimal("400.00"), "USD");

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        VerifyPaymentRequest request = new VerifyPaymentRequest(orderId, paymentId, fakeSignature);
        PaymentVerificationResponse response = paymentService.verifyPayment(request, 1L, false);

        assertThat(response.signatureValid()).isFalse();
        assertThat(response.bookingConfirmed()).isFalse();
        assertThat(response.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getErrorCode()).isEqualTo("INVALID_SIGNATURE");

        verify(bookingService, never()).confirmBooking(any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("verifyPayment: Duplicate callback idempotency guard returns existing success without re-confirming")
    void verifyPayment_DuplicateCallback_Idempotent() {
        String orderId = "order_test12345678";
        String paymentId = "pay_test98765432";
        String signature = "valid_sig";

        Payment payment = new Payment(100L, orderId, new BigDecimal("400.00"), "USD");
        payment.markSuccess(paymentId, signature);

        BookingResponse booking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("400.00"));

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));
        when(bookingService.getBookingById(100L)).thenReturn(booking);

        VerifyPaymentRequest request = new VerifyPaymentRequest(orderId, paymentId, signature);
        PaymentVerificationResponse response = paymentService.verifyPayment(request, 1L, false);

        assertThat(response.signatureValid()).isTrue();
        assertThat(response.bookingConfirmed()).isTrue();
        assertThat(response.message()).contains("already confirmed");

        // Verify that bookingService.confirmBooking was NOT invoked again!
        verify(bookingService, never()).confirmBooking(any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("handleWebhook: Handles payment.captured event and confirms booking")
    void handleWebhook_PaymentCaptured_ConfirmsBooking() {
        String orderId = "order_webhook123";
        String paymentId = "pay_webhook987";

        Payment payment = new Payment(100L, orderId, new BigDecimal("400.00"), "USD");
        BookingResponse confirmedBooking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("400.00"));

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingService.confirmBooking(eq(100L), any(), eq(true))).thenReturn(confirmedBooking);

        RazorpayWebhookPayload payload = new RazorpayWebhookPayload(
                "payment.captured",
                Map.of("payment", Map.of("entity", Map.of("order_id", orderId, "id", paymentId)))
        );

        PaymentVerificationResponse response = paymentService.handleWebhook(payload, "sig_header");

        assertThat(response).isNotNull();
        assertThat(response.bookingConfirmed()).isTrue();
        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);

        verify(bookingService).confirmBooking(eq(100L), any(), eq(true));
    }

    @Test
    @DisplayName("createUpiPaymentOrder: Successfully creates a dynamic UPI QR order with standard UPI URI")
    void createUpiPaymentOrder_Success() {
        BookingResponse pendingBooking = createMockBooking(100L, BookingStatus.PENDING_PAYMENT, new BigDecimal("100.00"));

        when(bookingService.getBookingById(100L)).thenReturn(pendingBooking);
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        UpiPaymentOrderResponse response = paymentService.createUpiPaymentOrder(new CreateUpiPaymentOrderRequest(100L), 1L);

        assertThat(response).isNotNull();
        assertThat(response.bookingId()).isEqualTo(100L);
        assertThat(response.upiId()).isEqualTo("6302714896@mbk");
        assertThat(response.payeeName()).isEqualTo("MysteryStay Prive");
        assertThat(response.currency()).isEqualTo("INR");
        assertThat(response.amountInInr()).isEqualTo(new BigDecimal("8500.00")); // 100 * 85
        assertThat(response.upiUri()).contains("pa=6302714896@mbk");
        assertThat(response.upiUri()).contains("cu=INR");
        assertThat(response.upiUri()).contains("am=8500.00");
        assertThat(response.supportedApps()).contains("Google Pay", "PhonePe", "Paytm");
        assertThat(response.status()).isEqualTo(PaymentStatus.PENDING);

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("verifyUpiPayment: Successfully verifies payment, marks SUCCESS and confirms booking")
    void verifyUpiPayment_Success() {
        Payment payment = new Payment(100L, "upi_ord_12345", new BigDecimal("8500.00"), "INR");
        payment.setPaymentMethod("UPI_QR");
        payment.setUpiVpa("6302714896@mbk");
        payment.setStatus(PaymentStatus.PENDING);
        String ref = payment.getPaymentReference();

        BookingResponse confirmedBooking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("100.00"));

        when(paymentRepository.findByPaymentReference(ref)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingService.confirmBooking(eq(100L), eq(1L), eq(false))).thenReturn(confirmedBooking);

        PaymentVerificationResponse response = paymentService.verifyUpiPayment(
                new VerifyUpiPaymentRequest(ref, "UPI_UTR_99887766", "Paid via Google Pay"),
                1L,
                false
        );

        assertThat(response).isNotNull();
        assertThat(response.bookingConfirmed()).isTrue();
        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getUpiTransactionId()).isEqualTo("UPI_UTR_99887766");

        verify(bookingService).confirmBooking(100L, 1L, false);
    }

    @Test
    @DisplayName("verifyUpiPayment: Idempotent guard returns existing confirmed result if already SUCCESS")
    void verifyUpiPayment_Idempotent() {
        Payment payment = new Payment(100L, "upi_ord_12345", new BigDecimal("8500.00"), "INR");
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.markUpiSuccess("UPI_UTR_ALREADY_VERIFIED");
        String ref = payment.getPaymentReference();

        BookingResponse confirmedBooking = createMockBooking(100L, BookingStatus.CONFIRMED, new BigDecimal("100.00"));
        when(paymentRepository.findByPaymentReference(ref)).thenReturn(Optional.of(payment));
        when(bookingService.getBookingById(100L)).thenReturn(confirmedBooking);

        PaymentVerificationResponse response = paymentService.verifyUpiPayment(
                new VerifyUpiPaymentRequest(ref, "UPI_UTR_ALREADY_VERIFIED", "Duplicate retry"),
                1L,
                false
        );

        assertThat(response).isNotNull();
        assertThat(response.bookingConfirmed()).isTrue();
        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);

        verify(bookingService, never()).confirmBooking(any(), any(), anyBoolean());
    }
}
