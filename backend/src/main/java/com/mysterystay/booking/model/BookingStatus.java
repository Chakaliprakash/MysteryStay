package com.mysterystay.booking.model;

/**
 * State machine stages for the transactional booking workflow.
 */
public enum BookingStatus {
    /**
     * Initial reservation state holding pessimistic inventory with a 15-minute expiration timer.
     * Hotel identity is strictly masked.
     */
    PENDING_PAYMENT,

    /**
     * Payment has succeeded and been verified.
     * Hotel identity is unlocked and revealed to traveler.
     */
    CONFIRMED,

    /**
     * Booking cancelled by customer or admin.
     * Held inventory is released back to the room ledger.
     */
    CANCELLED,

    /**
     * Reservation hold expired before payment was completed.
     * Inventory is automatically released by the background worker.
     */
    EXPIRED
}
