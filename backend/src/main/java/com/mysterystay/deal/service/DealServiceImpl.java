package com.mysterystay.deal.service;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.deal.dto.CreateMysteryDealRequest;
import com.mysterystay.deal.dto.ManagerDealResponse;
import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.deal.repository.MysteryDealRepository;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class DealServiceImpl implements DealService {

    private static final Logger log = LoggerFactory.getLogger(DealServiceImpl.class);

    private final MysteryDealRepository mysteryDealRepository;
    private final RoomTypeRepository roomTypeRepository;

    public DealServiceImpl(
            MysteryDealRepository mysteryDealRepository,
            RoomTypeRepository roomTypeRepository) {
        this.mysteryDealRepository = mysteryDealRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @Override
    @Transactional
    public ManagerDealResponse createMysteryDeal(CreateMysteryDealRequest request, Long managerId, boolean isAdmin) {
        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
                .orElseThrow(() -> new AppException("Room type not found with ID: " + request.roomTypeId(), HttpStatus.NOT_FOUND, "ROOM_TYPE_NOT_FOUND"));

        if (!isAdmin && !roomType.getHotel().getManager().getId().equals(managerId)) {
            throw new AppException(
                    "You do not own the hotel associated with this room type",
                    HttpStatus.FORBIDDEN,
                    "FORBIDDEN_DEAL_RESOURCE"
            );
        }

        if (!roomType.getHotel().isVerified()) {
            throw new AppException(
                    "Cannot create mystery deals for an unverified hotel",
                    HttpStatus.BAD_REQUEST,
                    "HOTEL_NOT_VERIFIED"
            );
        }

        if (!request.isValidRange()) {
            throw new AppException("Invalid deal dates: validTo cannot be before validFrom", HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE");
        }

        // Calculate discounted mystery price
        BigDecimal discountFactor = BigDecimal.valueOf(100 - request.discountPercent())
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal mysteryPrice = roomType.getBasePrice()
                .multiply(discountFactor)
                .setScale(2, RoundingMode.HALF_UP);

        MysteryDeal deal = new MysteryDeal(
                roomType,
                request.mysteryTitle().trim(),
                request.descriptionClues().trim(),
                request.discountPercent(),
                mysteryPrice,
                request.validFrom(),
                request.validTo()
        );

        MysteryDeal saved = mysteryDealRepository.save(deal);
        log.info("Mystery Deal published [ID: {}, Title: '{}'] with {}% discount. Mystery Rate: ${}",
                saved.getId(), saved.getMysteryTitle(), saved.getDiscountPercent(), saved.getMysteryPrice());

        return ManagerDealResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaskedDealResponse> getAllActiveMysteryDeals() {
        return mysteryDealRepository.findAllActiveDealsWithDetails(LocalDate.now()).stream()
                .map(MaskedDealResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaskedDealResponse getMaskedDealById(Long dealId) {
        MysteryDeal deal = mysteryDealRepository.findActiveByIdWithDetails(dealId)
                .orElseThrow(() -> new AppException("Mystery deal not found or inactive with ID: " + dealId, HttpStatus.NOT_FOUND, "DEAL_NOT_FOUND"));
        return MaskedDealResponse.from(deal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManagerDealResponse> getMyDeals(Long managerId) {
        return mysteryDealRepository.findByManagerId(managerId).stream()
                .map(ManagerDealResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ManagerDealResponse toggleDealStatus(Long dealId, boolean active, Long managerId, boolean isAdmin) {
        MysteryDeal deal = mysteryDealRepository.findById(dealId)
                .orElseThrow(() -> new AppException("Mystery deal not found with ID: " + dealId, HttpStatus.NOT_FOUND, "DEAL_NOT_FOUND"));

        if (!isAdmin && !deal.getRoomType().getHotel().getManager().getId().equals(managerId)) {
            throw new AppException("You do not own this deal", HttpStatus.FORBIDDEN, "FORBIDDEN_DEAL_RESOURCE");
        }

        deal.setActive(active);
        MysteryDeal updated = mysteryDealRepository.save(deal);
        log.info("Mystery deal ID: {} active status set to: {}", dealId, active);

        return ManagerDealResponse.from(updated);
    }
}
