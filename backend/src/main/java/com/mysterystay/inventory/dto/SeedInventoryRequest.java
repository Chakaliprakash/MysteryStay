package com.mysterystay.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SeedInventoryRequest(
        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Total rooms count is required")
        @Min(value = 1, message = "Total rooms must be at least 1")
        Integer totalRooms,

        @DecimalMin(value = "1.00", message = "Price override must be at least 1.00")
        BigDecimal priceOverride
) {
    public boolean isValidRange() {
        return startDate != null && endDate != null && !endDate.isBefore(startDate);
    }
}
