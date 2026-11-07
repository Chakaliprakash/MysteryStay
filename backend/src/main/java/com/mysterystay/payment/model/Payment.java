package com.mysterystay.payment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_reference", nullable = false, unique = true, length = 36)
    private String paymentReference;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "razorpay_order_id", nullable = false, unique = true, length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod = "RAZORPAY";

    @Column(name = "upi_vpa", length = 100)
    private String upiVpa;

    @Column(name = "upi_transaction_id", length = 100)
    private String upiTransactionId;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    @Column(name = "error_description", length = 255)
    private String errorDescription;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Payment() {
        this.paymentReference = UUID.randomUUID().toString();
        this.status = PaymentStatus.CREATED;
    }

    public Payment(Long bookingId, String razorpayOrderId, BigDecimal amount, String currency) {
        this();
        this.bookingId = bookingId;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = (currency != null && !currency.isBlank()) ? currency : "USD";
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.paymentReference == null) {
            this.paymentReference = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = PaymentStatus.CREATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void markSuccess(String razorpayPaymentId, String razorpaySignature) {
        this.status = PaymentStatus.SUCCESS;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.errorCode = null;
        this.errorDescription = null;
    }

    public void markUpiSuccess(String upiTransactionId) {
        this.status = PaymentStatus.SUCCESS;
        this.upiTransactionId = upiTransactionId;
        this.razorpayPaymentId = upiTransactionId;
        this.errorCode = null;
        this.errorDescription = null;
    }

    public void markExpired() {
        this.status = PaymentStatus.EXPIRED;
        this.errorCode = "PAYMENT_EXPIRED";
        this.errorDescription = "Payment QR code session expired";
    }

    public void markFailed(String errorCode, String errorDescription) {
        this.status = PaymentStatus.FAILED;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorDescription() {
        return errorDescription;
    }

    public void setErrorDescription(String errorDescription) {
        this.errorDescription = errorDescription;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getUpiVpa() {
        return upiVpa;
    }

    public void setUpiVpa(String upiVpa) {
        this.upiVpa = upiVpa;
    }

    public String getUpiTransactionId() {
        return upiTransactionId;
    }

    public void setUpiTransactionId(String upiTransactionId) {
        this.upiTransactionId = upiTransactionId;
    }
}
