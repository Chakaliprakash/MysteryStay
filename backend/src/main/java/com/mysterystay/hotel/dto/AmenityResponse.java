package com.mysterystay.hotel.dto;

import com.mysterystay.hotel.model.Amenity;

public record AmenityResponse(
        Long id,
        String name,
        String iconKey,
        String description,
        boolean mysteryClue
) {
    public static AmenityResponse from(Amenity amenity) {
        return new AmenityResponse(
                amenity.getId(),
                amenity.getName(),
                amenity.getIconKey(),
                amenity.getDescription(),
                amenity.isMysteryClue()
        );
    }
}
