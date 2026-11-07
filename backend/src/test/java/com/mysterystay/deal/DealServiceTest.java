package com.mysterystay.deal;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.deal.dto.CreateMysteryDealRequest;
import com.mysterystay.deal.dto.ManagerDealResponse;
import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.deal.service.DealServiceImpl;
import com.mysterystay.hotel.model.Amenity;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomCategory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock
    private MysteryDealRepository mysteryDealRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    private DealServiceImpl dealService;

    private User manager;
    private Hotel verifiedHotel;
    private RoomType roomType;

    @BeforeEach
    void setUp() {
        dealService = new DealServiceImpl(mysteryDealRepository, roomTypeRepository);

        manager = new User("manager@hotel.com", "pass", "Bob", null, UserRole.ROLE_HOTEL_MANAGER);
        manager.setId(10L);

        verifiedHotel = new Hotel(manager, "Grand Azure Palace", "Azure", 5, "Secret Address 123",
                "Bangalore", "Indiranagar", "560038", BigDecimal.ZERO, BigDecimal.ZERO, "+919876543210", "stay@azure.com");
        verifiedHotel.setId(100L);
        verifiedHotel.setVerified(true);
        verifiedHotel.setAmenities(Set.of(
                new Amenity("Rooftop Pool", "waves", "Pool", true),
                new Amenity("Private Office", "laptop", "Private non-clue", false)
        ));

        roomType = new RoomType(verifiedHotel, "Executive Suite", RoomCategory.EXECUTIVE_SUITE, "Luxury", 2, 1, new BigDecimal("300.00"));
        roomType.setId(5L);
    }

    @Test
    @DisplayName("createMysteryDeal: computes 40% discount correctly ($300.00 -> $180.00) and saves deal")
    void createMysteryDeal_Success() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(10);

        CreateMysteryDealRequest request = new CreateMysteryDealRequest(
                5L, "5-Star Luxury Retreat in Indiranagar", "Includes panoramic views", 40, start, end
        );

        when(roomTypeRepository.findById(5L)).thenReturn(Optional.of(roomType));
        when(mysteryDealRepository.save(any(MysteryDeal.class))).thenAnswer(inv -> {
            MysteryDeal d = inv.getArgument(0);
            d.setId(1L);
            return d;
        });

        ManagerDealResponse response = dealService.createMysteryDeal(request, 10L, false);

        assertThat(response).isNotNull();
        assertThat(response.dealId()).isEqualTo(1L);
        assertThat(response.discountPercent()).isEqualTo(40);
        assertThat(response.originalPrice()).isEqualByComparingTo("300.00");
        assertThat(response.mysteryPrice()).isEqualByComparingTo("180.00"); // 300 * (1 - 0.40)
        verify(mysteryDealRepository).save(any(MysteryDeal.class));
    }

    @Test
    @DisplayName("createMysteryDeal: rejects unverified hotel with 400 Bad Request")
    void createMysteryDeal_UnverifiedHotel_ThrowsBadRequest() {
        verifiedHotel.setVerified(false);
        CreateMysteryDealRequest request = new CreateMysteryDealRequest(
                5L, "Title", "Clues", 30, LocalDate.now(), LocalDate.now().plusDays(5)
        );

        when(roomTypeRepository.findById(5L)).thenReturn(Optional.of(roomType));

        assertThatThrownBy(() -> dealService.createMysteryDeal(request, 10L, false))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Cannot create mystery deals for an unverified hotel");
    }

    @Test
    @DisplayName("getAllActiveMysteryDeals: maps entity to MaskedDealResponse, filtering only mystery clues")
    void getAllActiveMysteryDeals_MaskedClues() {
        MysteryDeal deal = new MysteryDeal(
                roomType, "Urban Oasis", "Near dining hub", 35, new BigDecimal("195.00"),
                LocalDate.now(), LocalDate.now().plusDays(5)
        );
        deal.setId(99L);

        when(mysteryDealRepository.findAllActiveDealsWithDetails(any(LocalDate.class)))
                .thenReturn(List.of(deal));

        List<MaskedDealResponse> responses = dealService.getAllActiveMysteryDeals();

        assertThat(responses).hasSize(1);
        MaskedDealResponse masked = responses.get(0);
        assertThat(masked.mysteryTitle()).isEqualTo("Urban Oasis");
        assertThat(masked.city()).isEqualTo("Bangalore");
        assertThat(masked.zoneArea()).isEqualTo("Indiranagar");
        assertThat(masked.starRating()).isEqualTo(5);
        assertThat(masked.amenityClues()).containsExactly("Rooftop Pool"); // Only true clue included
    }
}
