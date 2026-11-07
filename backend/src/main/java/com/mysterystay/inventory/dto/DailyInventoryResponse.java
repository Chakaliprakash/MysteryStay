package com.mysterystay.inventory.dto;

import com.mysterystay.inventory.model.RoomInventory;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyInventoryResponse(
        Long id,
        Long roomTypeId,
        LocalDate date,
        int totalRooms,
        int bookedRooms,
        int availableRooms,
        BigDecimal effectivePrice
) {
    public static DailyInventoryResponse from(RoomInventory inventory) {
        BigDecimal effectivePrice = inventory.getPriceOverride() != null
                ? inventory.getPriceOverride()
                : inventory.getRoomType().getBasePrice();

        return new DailyInventoryResponse(
                inventory.getId(),
                inventory.getRoomType().getId(),
                inventory.getInventoryDate(),
                inventory.getTotalRooms(),
                inventory.getBookedRooms(),
                inventory.getAvailableRooms(),
                effectivePrice
        );
    }
}
