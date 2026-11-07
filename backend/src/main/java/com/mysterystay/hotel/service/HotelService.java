package com.mysterystay.hotel.service;

import com.mysterystay.hotel.dto.CreateHotelRequest;
import com.mysterystay.hotel.dto.HotelDetailResponse;
import com.mysterystay.hotel.dto.HotelSummaryResponse;
import com.mysterystay.hotel.dto.UpdateHotelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HotelService {

    HotelDetailResponse createHotel(CreateHotelRequest request, Long managerId);

    List<HotelSummaryResponse> getMyHotels(Long managerId);

    HotelDetailResponse getHotelById(Long hotelId, Long requesterId, boolean isAdmin);

    HotelDetailResponse updateHotel(Long hotelId, UpdateHotelRequest request, Long managerId, boolean isAdmin);

    HotelDetailResponse verifyHotel(Long hotelId, boolean verify);

    Page<HotelSummaryResponse> getAllHotelsForAdmin(Pageable pageable);
}
