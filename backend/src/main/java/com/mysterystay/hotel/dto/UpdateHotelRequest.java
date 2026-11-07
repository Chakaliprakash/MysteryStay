package com.mysterystay.hotel.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Set;

public record UpdateHotelRequest(
        @NotBlank(message = "Hotel name is required")
        @Size(max = 150)
        String name,

        @Size(max = 100)
        String brandChain,

        @NotNull(message = "Star rating is required")
        @Min(1)
        @Max(5)
        Integer starRating,

        @NotBlank(message = "Address is required")
        @Size(max = 255)
        String address,

        @NotBlank(message = "City is required")
        @Size(max = 100)
        String city,

        @NotBlank(message = "Zone area is required")
        @Size(max = 100)
        String zoneArea,

        @NotBlank(message = "Postal code is required")
        @Size(max = 20)
        String postalCode,

        @NotNull
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal latitude,

        @NotNull
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal longitude,

        @Size(max = 20)
        String phone,

        @Email
        @Size(max = 150)
        String email,

        Set<Long> amenityIds,

        Boolean active
) {}
