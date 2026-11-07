package com.mysterystay.inventory.service;

import com.mysterystay.common.exception.AppException;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.hotel.repository.HotelRepository;
import com.mysterystay.inventory.dto.*;
import com.mysterystay.inventory.model.RoomInventory;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.inventory.repository.RoomInventoryRepository;
import com.mysterystay.inventory.repository.RoomTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomInventoryRepository roomInventoryRepository;

    public InventoryServiceImpl(
            HotelRepository hotelRepository,
            RoomTypeRepository roomTypeRepository,
            RoomInventoryRepository roomInventoryRepository) {
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomInventoryRepository = roomInventoryRepository;
    }

    @Override
    @Transactional
    public RoomTypeResponse createRoomType(Long hotelId, CreateRoomTypeRequest request, Long managerId, boolean isAdmin) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException("Hotel not found with ID: " + hotelId, HttpStatus.NOT_FOUND, "HOTEL_NOT_FOUND"));

        validateOwnership(hotel, managerId, isAdmin);

        if (!hotel.isVerified()) {
            throw new AppException(
                    "Cannot configure room inventory for unverified hotel. Platform admin verification required.",
                    HttpStatus.BAD_REQUEST,
                    "HOTEL_NOT_VERIFIED"
            );
        }

        if (roomTypeRepository.existsByHotelIdAndName(hotelId, request.name().trim())) {
            throw new AppException(
                    "Room type with name '" + request.name() + "' already exists for this hotel",
                    HttpStatus.CONFLICT,
                    "ROOM_TYPE_ALREADY_EXISTS"
            );
        }

        RoomType roomType = new RoomType(
                hotel,
                request.name().trim(),
                request.category(),
                request.description() != null ? request.description().trim() : null,
                request.maxAdults(),
                request.maxChildren(),
                request.basePrice()
        );

        RoomType saved = roomTypeRepository.save(roomType);
        log.info("Room type created successfully [ID: {}, Name: '{}'] for Hotel ID: {}", saved.getId(), saved.getName(), hotelId);

        return RoomTypeResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomTypeResponse> getRoomTypesByHotel(Long hotelId) {
        return roomTypeRepository.findByHotelIdAndActiveTrue(hotelId).stream()
                .map(RoomTypeResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public List<DailyInventoryResponse> seedInventory(
            Long hotelId, Long roomTypeId, SeedInventoryRequest request, Long managerId, boolean isAdmin) {

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException("Hotel not found with ID: " + hotelId, HttpStatus.NOT_FOUND, "HOTEL_NOT_FOUND"));

        validateOwnership(hotel, managerId, isAdmin);

        RoomType roomType = roomTypeRepository.findByIdAndHotelId(roomTypeId, hotelId)
                .orElseThrow(() -> new AppException("Room type not found with ID: " + roomTypeId + " for hotel: " + hotelId, HttpStatus.NOT_FOUND, "ROOM_TYPE_NOT_FOUND"));

        if (!request.isValidRange()) {
            throw new AppException("Invalid date range: End date cannot be before start date", HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE");
        }

        List<RoomInventory> modifiedInventories = new ArrayList<>();
        LocalDate currentDate = request.startDate();

        while (!currentDate.isAfter(request.endDate())) {
            LocalDate date = currentDate;
            RoomInventory inventory = roomInventoryRepository
                    .findByRoomTypeIdAndInventoryDate(roomTypeId, date)
                    .orElseGet(() -> new RoomInventory(roomType, date, request.totalRooms(), request.priceOverride()));

            inventory.setTotalRooms(request.totalRooms());
            if (request.priceOverride() != null) {
                inventory.setPriceOverride(request.priceOverride());
            }

            modifiedInventories.add(roomInventoryRepository.save(inventory));
            currentDate = currentDate.plusDays(1);
        }

        log.info("Seeded inventory for room type ID: {} from {} to {} (total {} days)",
                roomTypeId, request.startDate(), request.endDate(), modifiedInventories.size());

        return modifiedInventories.stream()
                .map(DailyInventoryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyInventoryResponse> getInventoryCalendar(Long roomTypeId, LocalDate startDate, LocalDate endDate) {
        return roomInventoryRepository
                .findByRoomTypeIdAndInventoryDateBetweenOrderByInventoryDateAsc(roomTypeId, startDate, endDate)
                .stream()
                .map(DailyInventoryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryAvailabilityResponse checkAvailability(
            Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount) {

        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new AppException("Check-out date must be strictly after check-in date", HttpStatus.BAD_REQUEST, "INVALID_STAY_DATES");
        }

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException("Room type not found with ID: " + roomTypeId, HttpStatus.NOT_FOUND, "ROOM_TYPE_NOT_FOUND"));

        LocalDate lastNight = checkOutDate.minusDays(1);
        long requiredNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);

        List<RoomInventory> dailyInventories = roomInventoryRepository
                .findByRoomTypeIdAndInventoryDateBetweenOrderByInventoryDateAsc(roomTypeId, checkInDate, lastNight);

        boolean fullyConfigured = dailyInventories.size() == requiredNights;
        boolean hasSufficientCapacity = fullyConfigured && dailyInventories.stream().allMatch(inv -> inv.canAccommodate(roomCount));

        int minAvailable = dailyInventories.stream()
                .mapToInt(RoomInventory::getAvailableRooms)
                .min()
                .orElse(0);

        BigDecimal totalCost = BigDecimal.ZERO;
        if (fullyConfigured) {
            for (RoomInventory inv : dailyInventories) {
                BigDecimal nightlyRate = inv.getPriceOverride() != null ? inv.getPriceOverride() : roomType.getBasePrice();
                totalCost = totalCost.add(nightlyRate.multiply(BigDecimal.valueOf(roomCount)));
            }
        }

        List<DailyInventoryResponse> breakdown = dailyInventories.stream()
                .map(DailyInventoryResponse::from)
                .toList();

        return new InventoryAvailabilityResponse(
                roomType.getId(),
                roomType.getName(),
                checkInDate,
                checkOutDate,
                (int) requiredNights,
                minAvailable,
                hasSufficientCapacity,
                totalCost,
                breakdown
        );
    }

    @Override
    @Transactional
    public void reserveInventoryWithLock(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount) {
        LocalDate lastNight = checkOutDate.minusDays(1);
        long requiredNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);

        List<RoomInventory> lockedInventories = roomInventoryRepository
                .findWithLockByDateRange(roomTypeId, checkInDate, lastNight);

        if (lockedInventories.size() != requiredNights) {
            throw new AppException("Inventory is not configured for the entire date range", HttpStatus.CONFLICT, "INSUFFICIENT_INVENTORY");
        }

        for (RoomInventory inv : lockedInventories) {
            if (!inv.canAccommodate(roomCount)) {
                throw new AppException(
                        "Sold out on date: " + inv.getInventoryDate() + " (Only " + inv.getAvailableRooms() + " available)",
                        HttpStatus.CONFLICT,
                        "SOLD_OUT"
                );
            }
            inv.reserve(roomCount);
        }

        roomInventoryRepository.saveAll(lockedInventories);
        log.info("Reserved {} rooms for RoomType: {} between {} and {}", roomCount, roomTypeId, checkInDate, checkOutDate);
    }

    @Override
    @Transactional
    public void releaseInventory(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, int roomCount) {
        LocalDate lastNight = checkOutDate.minusDays(1);
        List<RoomInventory> inventories = roomInventoryRepository
                .findWithLockByDateRange(roomTypeId, checkInDate, lastNight);

        for (RoomInventory inv : inventories) {
            inv.release(roomCount);
        }

        roomInventoryRepository.saveAll(inventories);
        log.info("Released {} rooms for RoomType: {} between {} and {}", roomCount, roomTypeId, checkInDate, checkOutDate);
    }

    private void validateOwnership(Hotel hotel, Long requesterId, boolean isAdmin) {
        if (!isAdmin && !hotel.getManager().getId().equals(requesterId)) {
            throw new AppException(
                    "You do not have permission to manage inventory for Hotel ID: " + hotel.getId(),
                    HttpStatus.FORBIDDEN,
                    "FORBIDDEN_HOTEL_RESOURCE"
            );
        }
    }
}
