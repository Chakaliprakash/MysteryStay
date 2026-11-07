package com.mysterystay.hotel.service;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.hotel.dto.CreateHotelRequest;
import com.mysterystay.hotel.dto.HotelDetailResponse;
import com.mysterystay.hotel.dto.HotelSummaryResponse;
import com.mysterystay.hotel.dto.UpdateHotelRequest;
import com.mysterystay.hotel.model.Amenity;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.AmenityRepository;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class HotelServiceImpl implements HotelService {

    private static final Logger log = LoggerFactory.getLogger(HotelServiceImpl.class);

    private final HotelRepository hotelRepository;
    private final AmenityRepository amenityRepository;
    private final UserRepository userRepository;

    public HotelServiceImpl(
            HotelRepository hotelRepository,
            AmenityRepository amenityRepository,
            UserRepository userRepository) {
        this.hotelRepository = hotelRepository;
        this.amenityRepository = amenityRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public HotelDetailResponse createHotel(CreateHotelRequest request, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new AppException("Manager user not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        if (manager.getRole() != UserRole.ROLE_HOTEL_MANAGER && manager.getRole() != UserRole.ROLE_ADMIN) {
            throw new AppException("Only registered hotel managers or admins can onboard properties", HttpStatus.FORBIDDEN, "FORBIDDEN_ROLE");
        }

        Hotel hotel = new Hotel(
                manager,
                request.name().trim(),
                request.brandChain() != null ? request.brandChain().trim() : null,
                request.starRating(),
                request.address().trim(),
                request.city().trim(),
                request.zoneArea().trim(),
                request.postalCode().trim(),
                request.latitude(),
                request.longitude(),
                request.phone() != null ? request.phone().trim() : null,
                request.email() != null ? request.email().trim().toLowerCase() : null
        );

        if (request.amenityIds() != null && !request.amenityIds().isEmpty()) {
            Set<Amenity> amenities = amenityRepository.findByIdIn(request.amenityIds());
            hotel.setAmenities(amenities);
        }

        Hotel savedHotel = hotelRepository.save(hotel);
        log.info("Hotel onboarded successfully [ID: {}, Name: '{}'] by manager ID: {}", savedHotel.getId(), savedHotel.getName(), managerId);

        return HotelDetailResponse.from(savedHotel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelSummaryResponse> getMyHotels(Long managerId) {
        return hotelRepository.findByManagerId(managerId).stream()
                .map(HotelSummaryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDetailResponse getHotelById(Long hotelId, Long requesterId, boolean isAdmin) {
        Hotel hotel = hotelRepository.findByIdWithAmenities(hotelId)
                .orElseThrow(() -> new AppException("Hotel not found with ID: " + hotelId, HttpStatus.NOT_FOUND, "HOTEL_NOT_FOUND"));

        validateOwnership(hotel, requesterId, isAdmin);
        return HotelDetailResponse.from(hotel);
    }

    @Override
    @Transactional
    public HotelDetailResponse updateHotel(Long hotelId, UpdateHotelRequest request, Long managerId, boolean isAdmin) {
        Hotel hotel = hotelRepository.findByIdWithAmenities(hotelId)
                .orElseThrow(() -> new AppException("Hotel not found with ID: " + hotelId, HttpStatus.NOT_FOUND, "HOTEL_NOT_FOUND"));

        validateOwnership(hotel, managerId, isAdmin);

        hotel.setName(request.name().trim());
        hotel.setBrandChain(request.brandChain() != null ? request.brandChain().trim() : null);
        hotel.setStarRating(request.starRating());
        hotel.setAddress(request.address().trim());
        hotel.setCity(request.city().trim());
        hotel.setZoneArea(request.zoneArea().trim());
        hotel.setPostalCode(request.postalCode().trim());
        hotel.setLatitude(request.latitude());
        hotel.setLongitude(request.longitude());
        hotel.setPhone(request.phone() != null ? request.phone().trim() : null);
        hotel.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);

        if (request.active() != null) {
            hotel.setActive(request.active());
        }

        if (request.amenityIds() != null) {
            Set<Amenity> amenities = request.amenityIds().isEmpty()
                    ? new HashSet<>()
                    : amenityRepository.findByIdIn(request.amenityIds());
            hotel.setAmenities(amenities);
        }

        Hotel updated = hotelRepository.save(hotel);
        log.info("Hotel ID: {} updated by requester ID: {}", hotelId, managerId);
        return HotelDetailResponse.from(updated);
    }

    @Override
    @Transactional
    public HotelDetailResponse verifyHotel(Long hotelId, boolean verify) {
        Hotel hotel = hotelRepository.findByIdWithAmenities(hotelId)
                .orElseThrow(() -> new AppException("Hotel not found with ID: " + hotelId, HttpStatus.NOT_FOUND, "HOTEL_NOT_FOUND"));

        hotel.setVerified(verify);
        Hotel updated = hotelRepository.save(hotel);
        log.info("Hotel ID: {} verification status updated to: {}", hotelId, verify);
        return HotelDetailResponse.from(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelSummaryResponse> getAllHotelsForAdmin(Pageable pageable) {
        return hotelRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(HotelSummaryResponse::from);
    }

    private void validateOwnership(Hotel hotel, Long requesterId, boolean isAdmin) {
        if (!isAdmin && !hotel.getManager().getId().equals(requesterId)) {
            throw new AppException(
                    "You do not have permission to access or modify hotel ID: " + hotel.getId(),
                    HttpStatus.FORBIDDEN,
                    "FORBIDDEN_HOTEL_RESOURCE"
            );
        }
    }
}
