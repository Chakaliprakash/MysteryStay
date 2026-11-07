package com.mysterystay.hotel.service;

import com.mysterystay.hotel.dto.AmenityResponse;

import java.util.List;

public interface AmenityService {

    List<AmenityResponse> getAllAmenities();

    List<AmenityResponse> getMysteryClueAmenities();
}
