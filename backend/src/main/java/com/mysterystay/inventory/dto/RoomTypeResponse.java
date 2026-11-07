package com.mysterystay.inventory.dto;

import com.mysterystay.inventory.model.RoomType;

import java.math.BigDecimal;
import java.time.Instant;

public record RoomTypeResponse(
        Long id,
        Long hotelId,
        String name,
        String category,
        String description,
        int maxAdults,
        int maxChildren,
        BigDecimal basePrice,
        boolean active,
        Instant createdAt
) {
    public static RoomTypeResponse from(RoomType roomType) {
        return new RoomTypeResponse(
                roomType.getId(),
                roomType.getHotel().getId(),
                roomType.getName(),
                roomType.getCategory().name(),
                roomType.getDescription(),
                roomType.getMaxAdults(),
                roomType.getMaxChildren(),
                roomType.getBasePrice(),
                roomType.isActive(),
                roomType.getCreatedAt()
        );
    }
}
