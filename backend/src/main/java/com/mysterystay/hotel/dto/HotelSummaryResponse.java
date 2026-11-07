package com.mysterystay.hotel.dto;

import com.mysterystay.hotel.model.Hotel;

import java.time.Instant;

public record HotelSummaryResponse(
        Long id,
        String name,
        String brandChain,
        int starRating,
        String city,
        String zoneArea,
        boolean verified,
        boolean active,
        int amenityCount,
        Instant createdAt
) {
    public static HotelSummaryResponse from(Hotel hotel) {
        return new HotelSummaryResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getBrandChain(),
                hotel.getStarRating(),
                hotel.getCity(),
                hotel.getZoneArea(),
                hotel.isVerified(),
                hotel.isActive(),
                hotel.getAmenities() != null ? hotel.getAmenities().size() : 0,
                hotel.getCreatedAt()
        );
    }
}
