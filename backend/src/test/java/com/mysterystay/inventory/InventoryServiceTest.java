package com.mysterystay.inventory;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.dto.*;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomInventory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomInventoryRepository;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import com.mysterystay.inventory.service.InventoryServiceImpl;
import com.mysterystay.user.model.User;
import com.mysterystay.user.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private RoomInventoryRepository roomInventoryRepository;

    private InventoryServiceImpl inventoryService;

    private User manager;
    private Hotel verifiedHotel;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryServiceImpl(hotelRepository, roomTypeRepository, roomInventoryRepository);

        manager = new User("manager@hotel.com", "pass", "Bob", null, UserRole.ROLE_HOTEL_MANAGER);
        manager.setId(10L);

        verifiedHotel = new Hotel(manager, "Grand Hotel", null, 5, "Street 1", "Bangalore", "Indiranagar",
                "560038", BigDecimal.ZERO, BigDecimal.ZERO, null, null);
        verifiedHotel.setId(100L);
        verifiedHotel.setVerified(true);
    }

    @Test
    @DisplayName("createRoomType: successfully creates room type when hotel is verified")
    void createRoomType_Success() {
        CreateRoomTypeRequest request = new CreateRoomTypeRequest(
                "Deluxe Suite", RoomCategory.DELUXE, "Spacious room", 2, 1, new BigDecimal("250.00")
        );

        when(hotelRepository.findById(100L)).thenReturn(Optional.of(verifiedHotel));
        when(roomTypeRepository.existsByHotelIdAndName(100L, "Deluxe Suite")).thenReturn(false);

        RoomType saved = new RoomType(verifiedHotel, "Deluxe Suite", RoomCategory.DELUXE, "Spacious room", 2, 1, new BigDecimal("250.00"));
        saved.setId(1L);
        when(roomTypeRepository.save(any(RoomType.class))).thenReturn(saved);

        RoomTypeResponse response = inventoryService.createRoomType(100L, request, 10L, false);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.basePrice()).isEqualByComparingTo("250.00");
    }

    @Test
    @DisplayName("createRoomType: throws BAD_REQUEST when hotel is unverified")
    void createRoomType_UnverifiedHotel_ThrowsBadRequest() {
        verifiedHotel.setVerified(false); // Unverified hotel
        CreateRoomTypeRequest request = new CreateRoomTypeRequest(
                "Deluxe Suite", RoomCategory.DELUXE, "Spacious room", 2, 1, new BigDecimal("250.00")
        );

        when(hotelRepository.findById(100L)).thenReturn(Optional.of(verifiedHotel));

        assertThatThrownBy(() -> inventoryService.createRoomType(100L, request, 10L, false))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Cannot configure room inventory for unverified hotel");
    }

    @Test
    @DisplayName("seedInventory: seeds daily room inventory rows across date range")
    void seedInventory_Success() {
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(3); // 3 days

        SeedInventoryRequest request = new SeedInventoryRequest(start, end, 10, new BigDecimal("220.00"));

        RoomType roomType = new RoomType(verifiedHotel, "Deluxe Suite", RoomCategory.DELUXE, null, 2, 1, new BigDecimal("250.00"));
        roomType.setId(1L);

        when(hotelRepository.findById(100L)).thenReturn(Optional.of(verifiedHotel));
        when(roomTypeRepository.findByIdAndHotelId(1L, 100L)).thenReturn(Optional.of(roomType));
        when(roomInventoryRepository.save(any(RoomInventory.class))).thenAnswer(inv -> inv.getArgument(0));

        List<DailyInventoryResponse> responses = inventoryService.seedInventory(100L, 1L, request, 10L, false);

        assertThat(responses).hasSize(3);
        verify(roomInventoryRepository, times(3)).save(any(RoomInventory.class));
    }

    @Test
    @DisplayName("checkAvailability: correctly identifies available rooms and calculates total stay cost")
    void checkAvailability_Success() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = checkIn.plusDays(2); // 2 nights

        RoomType roomType = new RoomType(verifiedHotel, "Deluxe Suite", RoomCategory.DELUXE, null, 2, 1, new BigDecimal("200.00"));
        roomType.setId(1L);

        RoomInventory day1 = new RoomInventory(roomType, checkIn, 10, null);
        RoomInventory day2 = new RoomInventory(roomType, checkIn.plusDays(1), 10, null);

        when(roomTypeRepository.findById(1L)).thenReturn(Optional.of(roomType));
        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetweenOrderByInventoryDateAsc(1L, checkIn, checkIn.plusDays(1)))
                .thenReturn(List.of(day1, day2));

        InventoryAvailabilityResponse response = inventoryService.checkAvailability(1L, checkIn, checkOut, 2);

        assertThat(response.available()).isTrue();
        assertThat(response.totalNights()).isEqualTo(2);
        assertThat(response.minAvailableRooms()).isEqualTo(10);
        assertThat(response.totalCost()).isEqualByComparingTo("800.00"); // 2 nights * 2 rooms * 200.00
    }

    @Test
    @DisplayName("reserveInventoryWithLock: throws CONFLICT when requested count exceeds available rooms")
    void reserveInventoryWithLock_ExceedsCapacity_ThrowsConflict() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = checkIn.plusDays(2);

        RoomType roomType = new RoomType(verifiedHotel, "Deluxe Suite", RoomCategory.DELUXE, null, 2, 1, new BigDecimal("200.00"));
        roomType.setId(1L);

        RoomInventory day1 = new RoomInventory(roomType, checkIn, 2, null); // Only 2 rooms
        RoomInventory day2 = new RoomInventory(roomType, checkIn.plusDays(1), 2, null);

        when(roomInventoryRepository.findWithLockByDateRange(1L, checkIn, checkIn.plusDays(1)))
                .thenReturn(List.of(day1, day2));

        assertThatThrownBy(() -> inventoryService.reserveInventoryWithLock(1L, checkIn, checkOut, 5)) // Request 5
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("Sold out on date");
    }
}
