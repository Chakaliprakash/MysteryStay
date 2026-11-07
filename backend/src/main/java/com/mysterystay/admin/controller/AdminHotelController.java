package com.mysterystay.admin.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.hotel.dto.HotelDetailResponse;
import com.mysterystay.hotel.dto.HotelSummaryResponse;
import com.mysterystay.hotel.service.HotelService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/hotels")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final HotelService hotelService;

    public AdminHotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HotelSummaryResponse>>> getAllHotels(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HotelSummaryResponse> hotels = hotelService.getAllHotelsForAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(hotels, "All platform hotels retrieved"));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<HotelDetailResponse>> verifyHotel(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean verify) {
        HotelDetailResponse response = hotelService.verifyHotel(id, verify);
        String msg = verify ? "Hotel verified successfully" : "Hotel unverified successfully";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }
}
