package com.mysterystay.inventory.service;

import com.mysterystay.inventory.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface InventoryService {

    RoomTypeResponse createRoomType(Long hotelId, CreateRoomTypeRequest request, Long managerId, boolean isAdmin);

    List<RoomTypeResponse> getRoomTypesByHotel(Long hotelId);

    List<DailyInventoryResponse> seedInventory(
            Long hotelId, Long roomTypeId, SeedInventoryRequest request, Long managerId, boolean isAdmin);

    List<DailyInventoryResponse> getInventoryCalendar(Long roomTypeId, LocalDate startDate, LocalDate endDate);

    InventoryAvailabilityResponse checkAvailability(
            Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount);

    void reserveInventoryWithLock(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount);

    void releaseInventory(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount);
}
