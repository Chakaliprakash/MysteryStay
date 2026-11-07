package com.mysterystay.deal.dto;

import com.mysterystay.deal.model.MysteryDeal;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ManagerDealResponse(
        Long dealId,
        Long hotelId,
        String hotelName,
        Long roomTypeId,
        String roomTypeName,
        String mysteryTitle,
        int discountPercent,
        BigDecimal originalPrice,
        BigDecimal mysteryPrice,
        LocalDate validFrom,
        LocalDate validTo,
        boolean active,
        Instant createdAt
) {
    public static ManagerDealResponse from(MysteryDeal deal) {
        return new ManagerDealResponse(
                deal.getId(),
                deal.getRoomType().getHotel().getId(),
                deal.getRoomType().getHotel().getName(),
                deal.getRoomType().getId(),
                deal.getRoomType().getName(),
                deal.getMysteryTitle(),
                deal.getDiscountPercent(),
                deal.getRoomType().getBasePrice(),
                deal.getMysteryPrice(),
                deal.getValidFrom(),
                deal.getValidTo(),
                deal.isActive(),
                deal.getCreatedAt()
        );
    }
}
