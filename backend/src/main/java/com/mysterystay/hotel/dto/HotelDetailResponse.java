package com.mysterystay.hotel.dto;

import com.mysterystay.hotel.model.Hotel;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record HotelDetailResponse(
        Long id,
        Long managerId,
        String managerEmail,
        String name,
        String brandChain,
        int starRating,
        String address,
        String city,
        String zoneArea,
        String postalCode,
        BigDecimal latitude,
        BigDecimal longitude,
        String phone,
        String email,
        boolean verified,
        boolean active,
        List<AmenityResponse> amenities,
        Instant createdAt,
        Instant updatedAt
) {
    public static HotelDetailResponse from(Hotel hotel) {
        List<AmenityResponse> amenityResponses = hotel.getAmenities() != null
                ? hotel.getAmenities().stream().map(AmenityResponse::from).toList()
                : List.of();

        return new HotelDetailResponse(
                hotel.getId(),
                hotel.getManager().getId(),
                hotel.getManager().getEmail(),
                hotel.getName(),
                hotel.getBrandChain(),
                hotel.getStarRating(),
                hotel.getAddress(),
                hotel.getCity(),
                hotel.getZoneArea(),
                hotel.getPostalCode(),
                hotel.getLatitude(),
                hotel.getLongitude(),
                hotel.getPhone(),
                hotel.getEmail(),
                hotel.isVerified(),
                hotel.isActive(),
                amenityResponses,
                hotel.getCreatedAt(),
                hotel.getUpdatedAt()
        );
    }
}
