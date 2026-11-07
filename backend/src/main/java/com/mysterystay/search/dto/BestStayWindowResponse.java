package com.mysterystay.search.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Result of the sliding window price optimizer identifying the cheapest consecutive stay window.
 */
public record BestStayWindowResponse(
        Long dealId,
        int stayLength,
        LocalDate bestCheckInDate,
        LocalDate bestCheckOutDate,
        BigDecimal totalCost,
        BigDecimal averageNightlyRate,
        BigDecimal savingsVsWorstWindow,
        long executionTimeMicros,
        String algorithmUsed
) {}
