package com.mysterystay.hotel.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.hotel.dto.AmenityResponse;
import com.mysterystay.hotel.service.AmenityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/amenities")
public class AmenityController {

    private final AmenityService amenityService;

    public AmenityController(AmenityService amenityService) {
        this.amenityService = amenityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AmenityResponse>>> getAllAmenities() {
        List<AmenityResponse> amenities = amenityService.getAllAmenities();
        return ResponseEntity.ok(ApiResponse.success(amenities, "Amenities retrieved successfully"));
    }

    @GetMapping("/clues")
    public ResponseEntity<ApiResponse<List<AmenityResponse>>> getMysteryClueAmenities() {
        List<AmenityResponse> clues = amenityService.getMysteryClueAmenities();
        return ResponseEntity.ok(ApiResponse.success(clues, "Mystery clue amenities retrieved successfully"));
    }
}
