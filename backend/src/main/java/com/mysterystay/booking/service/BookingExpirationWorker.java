package com.mysterystay.booking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background worker task periodically sweeping for expired 15-minute booking holds.
 * Automatically restores room inventory to the availability ledger.
 */
@Component
public class BookingExpirationWorker {

    private static final Logger log = LoggerFactory.getLogger(BookingExpirationWorker.class);

    private final BookingService bookingService;

    public BookingExpirationWorker(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Executes every 60 seconds to release inventory for abandoned checkout sessions.
     */
    @Scheduled(fixedRate = 60000)
    public void sweepExpiredBookings() {
        int expiredCount = bookingService.expirePendingBookings();
        if (expiredCount > 0) {
            log.info("BookingExpirationWorker cleaned up {} expired reservation holds.", expiredCount);
        }
    }
}
