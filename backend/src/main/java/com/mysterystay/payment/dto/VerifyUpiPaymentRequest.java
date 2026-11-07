package com.mysterystay.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyUpiPaymentRequest(
        @NotBlank(message = "Payment reference is required")
        String paymentReference,

        String upiTransactionId,

        String remarks
) {}
