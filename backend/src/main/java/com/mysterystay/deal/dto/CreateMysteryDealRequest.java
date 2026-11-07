package com.mysterystay.deal.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateMysteryDealRequest(
        @NotNull(message = "Room type ID is required")
        Long roomTypeId,

        @NotBlank(message = "Mystery title is required")
        @Size(max = 150, message = "Title cannot exceed 150 characters")
        String mysteryTitle,

        @NotBlank(message = "Description clues are required")
        String descriptionClues,

        @NotNull(message = "Discount percent is required")
        @Min(value = 10, message = "Discount must be at least 10%")
        @Max(value = 80, message = "Discount cannot exceed 80%")
        Integer discountPercent,

        @NotNull(message = "Valid from date is required")
        LocalDate validFrom,

        @NotNull(message = "Valid to date is required")
        LocalDate validTo
) {
    public boolean isValidRange() {
        return validFrom != null && validTo != null && !validTo.isBefore(validFrom);
    }
}
