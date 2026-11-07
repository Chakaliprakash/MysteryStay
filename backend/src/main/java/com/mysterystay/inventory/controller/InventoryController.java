package com.mysterystay.inventory.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.inventory.dto.*;
import com.mysterystay.inventory.service.InventoryService;
import com.mysterystay.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/hotels/{hotelId}/room-types")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> createRoomType(
            @PathVariable Long hotelId,
            @Valid @RequestBody CreateRoomTypeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        RoomTypeResponse response = inventoryService.createRoomType(hotelId, request, principal.getId(), isAdmin);
        return new ResponseEntity<>(ApiResponse.success(response, "Room type created successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/hotels/{hotelId}/room-types")
    public ResponseEntity<ApiResponse<List<RoomTypeResponse>>> getRoomTypesByHotel(
            @PathVariable Long hotelId) {
        List<RoomTypeResponse> roomTypes = inventoryService.getRoomTypesByHotel(hotelId);
        return ResponseEntity.ok(ApiResponse.success(roomTypes, "Room types retrieved successfully"));
    }

    @PostMapping("/hotels/{hotelId}/room-types/{roomTypeId}/inventory")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DailyInventoryResponse>>> seedInventory(
            @PathVariable Long hotelId,
            @PathVariable Long roomTypeId,
            @Valid @RequestBody SeedInventoryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<DailyInventoryResponse> responses = inventoryService.seedInventory(
                hotelId, roomTypeId, request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(responses, "Room inventory calendar updated successfully"));
    }

    @GetMapping("/room-types/{roomTypeId}/inventory")
    public ResponseEntity<ApiResponse<List<DailyInventoryResponse>>> getInventoryCalendar(
            @PathVariable Long roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailyInventoryResponse> calendar = inventoryService.getInventoryCalendar(roomTypeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(calendar, "Daily inventory calendar retrieved"));
    }

    @GetMapping("/room-types/{roomTypeId}/availability")
    public ResponseEntity<ApiResponse<InventoryAvailabilityResponse>> checkAvailability(
            @PathVariable Long roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(defaultValue = "1") int roomCount) {
        InventoryAvailabilityResponse availability = inventoryService.checkAvailability(
                roomTypeId, checkInDate, checkOutDate, roomCount);
        return ResponseEntity.ok(ApiResponse.success(availability, "Inventory availability checked"));
    }
}
