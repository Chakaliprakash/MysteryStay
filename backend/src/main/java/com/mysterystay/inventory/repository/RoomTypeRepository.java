package com.mysterystay.inventory.repository;

import com.mysterystay.inventory.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findByHotelIdAndActiveTrue(Long hotelId);

    Optional<RoomType> findByIdAndHotelId(Long id, Long hotelId);

    boolean existsByHotelIdAndName(Long hotelId, String name);
}
