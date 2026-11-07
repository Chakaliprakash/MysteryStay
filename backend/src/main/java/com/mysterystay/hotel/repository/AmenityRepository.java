package com.mysterystay.hotel.repository;

import com.mysterystay.hotel.model.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    Optional<Amenity> findByName(String name);

    List<Amenity> findAllByMysteryClueTrue();

    Set<Amenity> findByIdIn(Set<Long> ids);
}
