package com.mysterystay.inventory.dto;

import com.mysterystay.inventory.model.RoomCategory;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateRoomTypeRequest(
        @NotBlank(message = "Room type name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,

        @NotNull(message = "Room category is required")
        RoomCategory category,

        String description,

        @NotNull(message = "Max adults capacity is required")
        @Min(value = 1, message = "Max adults must be at least 1")
        Integer maxAdults,

        @NotNull(message = "Max children capacity is required")
        @Min(value = 0, message = "Max children cannot be negative")
        Integer maxChildren,

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "1.00", message = "Base price must be at least 1.00")
        BigDecimal basePrice
) {}
