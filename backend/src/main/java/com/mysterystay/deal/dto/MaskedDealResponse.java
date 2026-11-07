package com.mysterystay.deal.dto;

import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.hotel.model.Amenity;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Public, strictly identity-masked Mystery Deal DTO.
 * Real hotel name, brand chain, street address, coordinates, and contact details
 * are intentionally omitted to preserve rate integrity.
 */
public record MaskedDealResponse(
        Long dealId,
        String mysteryTitle,
        String descriptionClues,
        String city,
        String zoneArea,
        int starRating,
        String roomCategory,
        int maxAdults,
        int maxChildren,
        BigDecimal originalPrice,
        BigDecimal mysteryPrice,
        int discountPercent,
        List<String> amenityClues,
        LocalDate validFrom,
        LocalDate validTo
) {
    public static MaskedDealResponse from(MysteryDeal deal) {
        RoomType rt = deal.getRoomType();
        Hotel h = rt.getHotel();

        List<String> clues = h.getAmenities() != null
                ? h.getAmenities().stream()
                    .filter(Amenity::isMysteryClue)
                    .map(Amenity::getName)
                    .toList()
                : List.of();

        return new MaskedDealResponse(
                deal.getId(),
                deal.getMysteryTitle(),
                deal.getDescriptionClues(),
                h.getCity(),
                h.getZoneArea(),
                h.getStarRating(),
                rt.getCategory().name(),
                rt.getMaxAdults(),
                rt.getMaxChildren(),
                rt.getBasePrice(),
                deal.getMysteryPrice(),
                deal.getDiscountPercent(),
                clues,
                deal.getValidFrom(),
                deal.getValidTo()
        );
    }
}
