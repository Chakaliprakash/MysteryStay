package com.mysterystay.hotel.service;

import com.mysterystay.hotel.dto.AmenityResponse;
import com.mysterystay.hotel.repository.AmenityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    public AmenityServiceImpl(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findAll().stream()
                .map(AmenityResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getMysteryClueAmenities() {
        return amenityRepository.findAllByMysteryClueTrue().stream()
                .map(AmenityResponse::from)
                .toList();
    }
}
