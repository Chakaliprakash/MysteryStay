package com.mysterystay.hotel;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.hotel.dto.CreateHotelRequest;
import com.mysterystay.hotel.dto.HotelDetailResponse;
import com.mysterystay.hotel.model.Amenity;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.AmenityRepository;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.hotel.service.HotelServiceImpl;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import com.mysterystay.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private AmenityRepository amenityRepository;

    @Mock
    private UserRepository userRepository;

    private HotelServiceImpl hotelService;

    @BeforeEach
    void setUp() {
        hotelService = new HotelServiceImpl(hotelRepository, amenityRepository, userRepository);
    }

    @Test
    @DisplayName("createHotel: successfully onboards property with verified=false for HOTEL_MANAGER")
    void createHotel_Success() {
        Long managerId = 10L;
        User manager = new User("manager@hotel.com", "pass", "Manager Bob", null, UserRole.ROLE_HOTEL_MANAGER);
        manager.setId(managerId);

        CreateHotelRequest request = new CreateHotelRequest(
                "Grand Azure Palace", "Azure Resorts", 5,
                "100 Ocean Drive", "Bangalore", "Indiranagar", "560038",
                new BigDecimal("12.9716000"), new BigDecimal("77.5946000"),
                "+919876543210", "stay@azure.com", Set.of(1L, 2L)
        );

        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
        when(amenityRepository.findByIdIn(Set.of(1L, 2L))).thenReturn(Set.of(
                new Amenity("WiFi", "wifi", "Fast WiFi", true)
        ));

        Hotel savedHotel = new Hotel(
                manager, request.name(), request.brandChain(), request.starRating(),
                request.address(), request.city(), request.zoneArea(), request.postalCode(),
                request.latitude(), request.longitude(), request.phone(), request.email()
        );
        savedHotel.setId(101L);
        when(hotelRepository.save(any(Hotel.class))).thenReturn(savedHotel);

        HotelDetailResponse response = hotelService.createHotel(request, managerId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.name()).isEqualTo("Grand Azure Palace");
        assertThat(response.verified()).isFalse(); // Initial state must be unverified
        verify(hotelRepository).save(any(Hotel.class));
    }

    @Test
    @DisplayName("createHotel: throws 403 Forbidden when a customer tries to onboard a hotel")
    void createHotel_CustomerRole_ThrowsForbidden() {
        Long customerId = 20L;
        User customer = new User("traveler@test.com", "pass", "Traveler Jane", null, UserRole.ROLE_CUSTOMER);
        customer.setId(customerId);

        CreateHotelRequest request = new CreateHotelRequest(
                "Fake Hotel", null, 3, "Fake Street", "Bangalore", "Whitefield", "560066",
                new BigDecimal("12.9716"), new BigDecimal("77.5946"), null, null, null
        );

        when(userRepository.findById(customerId)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> hotelService.createHotel(request, customerId))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN)
                .hasMessageContaining("Only registered hotel managers or admins");

        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    @Test
    @DisplayName("getHotelById: throws 403 when another manager attempts to access private hotel details")
    void getHotelById_DifferentManager_ThrowsForbidden() {
        Long ownerId = 10L;
        Long snooperId = 99L;

        User owner = new User("owner@hotel.com", "pass", "Owner", null, UserRole.ROLE_HOTEL_MANAGER);
        owner.setId(ownerId);

        Hotel hotel = new Hotel(owner, "Secret Haven", null, 4, "Addr", "City", "Zone", "123",
                BigDecimal.ZERO, BigDecimal.ZERO, null, null);
        hotel.setId(50L);

        when(hotelRepository.findByIdWithAmenities(50L)).thenReturn(Optional.of(hotel));

        assertThatThrownBy(() -> hotelService.getHotelById(50L, snooperId, false))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN)
                .hasMessageContaining("You do not have permission");
    }

    @Test
    @DisplayName("verifyHotel: updates hotel verification flag successfully")
    void verifyHotel_Success() {
        Long hotelId = 50L;
        User owner = new User("owner@hotel.com", "pass", "Owner", null, UserRole.ROLE_HOTEL_MANAGER);
        owner.setId(10L);

        Hotel hotel = new Hotel(owner, "Secret Haven", null, 4, "Addr", "City", "Zone", "123",
                BigDecimal.ZERO, BigDecimal.ZERO, null, null);
        hotel.setId(hotelId);
        hotel.setVerified(false);

        when(hotelRepository.findByIdWithAmenities(hotelId)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelDetailResponse response = hotelService.verifyHotel(hotelId, true);

        assertThat(response.verified()).isTrue();
        verify(hotelRepository).save(hotel);
    }
}
