package com.mysterystay.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RazorpayWebhookPayload(
        String event,
        Map<String, Object> payload
) {}
