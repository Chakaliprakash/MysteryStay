package com.mysterystay.deal.repository;

import com.mysterystay.deal.model.MysteryDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MysteryDealRepository extends JpaRepository<MysteryDeal, Long> {

    @Query("SELECT d FROM MysteryDeal d " +
            "JOIN FETCH d.roomType rt " +
            "JOIN FETCH rt.hotel h " +
            "LEFT JOIN FETCH h.amenities " +
            "WHERE d.active = true AND d.validTo >= :currentDate " +
            "ORDER BY d.discountPercent DESC")
    List<MysteryDeal> findAllActiveDealsWithDetails(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT d FROM MysteryDeal d " +
            "JOIN FETCH d.roomType rt " +
            "JOIN FETCH rt.hotel h " +
            "LEFT JOIN FETCH h.amenities " +
            "WHERE d.id = :id AND d.active = true")
    Optional<MysteryDeal> findActiveByIdWithDetails(@Param("id") Long id);

    @Query("SELECT d FROM MysteryDeal d " +
            "JOIN FETCH d.roomType rt " +
            "JOIN FETCH rt.hotel h " +
            "WHERE h.manager.id = :managerId " +
            "ORDER BY d.createdAt DESC")
    List<MysteryDeal> findByManagerId(@Param("managerId") Long managerId);
}
