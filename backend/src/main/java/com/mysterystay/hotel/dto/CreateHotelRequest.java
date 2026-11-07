package com.mysterystay.hotel.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Set;

public record CreateHotelRequest(
        @NotBlank(message = "Hotel name is required")
        @Size(max = 150, message = "Hotel name cannot exceed 150 characters")
        String name,

        @Size(max = 100, message = "Brand chain cannot exceed 100 characters")
        String brandChain,

        @NotNull(message = "Star rating is required")
        @Min(value = 1, message = "Star rating must be between 1 and 5")
        @Max(value = 5, message = "Star rating must be between 1 and 5")
        Integer starRating,

        @NotBlank(message = "Address is required")
        @Size(max = 255, message = "Address cannot exceed 255 characters")
        String address,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city,

        @NotBlank(message = "Zone/Neighborhood area is required")
        @Size(max = 100, message = "Zone area cannot exceed 100 characters")
        String zoneArea,

        @NotBlank(message = "Postal code is required")
        @Size(max = 20, message = "Postal code cannot exceed 20 characters")
        String postalCode,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
        BigDecimal latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
        BigDecimal longitude,

        @Size(max = 20, message = "Phone number cannot exceed 20 characters")
        String phone,

        @Email(message = "Invalid email format")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        Set<Long> amenityIds
) {}
