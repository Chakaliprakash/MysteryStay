package com.mysterystay.hotel.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.hotel.dto.CreateHotelRequest;
import com.mysterystay.hotel.dto.HotelDetailResponse;
import com.mysterystay.hotel.dto.HotelSummaryResponse;
import com.mysterystay.hotel.dto.UpdateHotelRequest;
import com.mysterystay.hotel.service.HotelService;
import com.mysterystay.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<HotelDetailResponse>> createHotel(
            @Valid @RequestBody CreateHotelRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        HotelDetailResponse response = hotelService.createHotel(request, principal.getId());
        return new ResponseEntity<>(
                ApiResponse.success(response, "Hotel onboarded successfully. Pending platform admin verification."),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<HotelSummaryResponse>>> getMyHotels(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<HotelSummaryResponse> hotels = hotelService.getMyHotels(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(hotels, "Properties retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<HotelDetailResponse>> getHotelById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        HotelDetailResponse response = hotelService.getHotelById(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Hotel details retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<HotelDetailResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHotelRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        HotelDetailResponse response = hotelService.updateHotel(id, request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Hotel updated successfully"));
    }
}
