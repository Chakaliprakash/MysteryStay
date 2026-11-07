package com.mysterystay.inventory.repository;

import com.mysterystay.inventory.model.RoomInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomInventoryRepository extends JpaRepository<RoomInventory, Long> {

    Optional<RoomInventory> findByRoomTypeIdAndInventoryDate(Long roomTypeId, LocalDate inventoryDate);

    List<RoomInventory> findByRoomTypeIdAndInventoryDateBetweenOrderByInventoryDateAsc(
            Long roomTypeId, LocalDate startDate, LocalDate endDate);

    /**
     * Pessimistic row locking for concurrency protection during reservations.
     * Prevents race conditions and double-booking across date ranges.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RoomInventory r WHERE r.roomType.id = :roomTypeId AND r.inventoryDate BETWEEN :startDate AND :endDate ORDER BY r.inventoryDate ASC")
    List<RoomInventory> findWithLockByDateRange(
            @Param("roomTypeId") Long roomTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
