package com.mysterystay.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InventoryAvailabilityResponse(
        Long roomTypeId,
        String roomTypeName,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int totalNights,
        int minAvailableRooms,
        boolean available,
        BigDecimal totalCost,
        List<DailyInventoryResponse> dailyBreakdown
) {}
