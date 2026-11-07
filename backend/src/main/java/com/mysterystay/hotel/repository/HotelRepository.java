package com.mysterystay.hotel.repository;

import com.mysterystay.hotel.model.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByManagerId(Long managerId);

    Optional<Hotel> findByIdAndManagerId(Long id, Long managerId);

    List<Hotel> findByCityAndVerifiedTrueAndActiveTrue(String city);

    List<Hotel> findByCityAndZoneAreaAndVerifiedTrueAndActiveTrue(String city, String zoneArea);

    @Query("SELECT h FROM Hotel h LEFT JOIN FETCH h.amenities WHERE h.id = :id")
    Optional<Hotel> findByIdWithAmenities(@Param("id") Long id);

    Page<Hotel> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
