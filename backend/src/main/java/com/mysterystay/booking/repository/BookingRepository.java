package com.mysterystay.booking.repository;

import com.mysterystay.booking.model.Booking;
import com.mysterystay.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByHotelIdOrderByCreatedAtDesc(Long hotelId);

    /**
     * Finds active holds that have exceeded their 15-minute TTL without payment completion.
     */
    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, Instant expiryThreshold);
}
