package com.mysterystay.inventory.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "room_inventories", uniqueConstraints = {
        @UniqueConstraint(name = "uq_room_date", columnNames = {"room_type_id", "inventory_date"})
})
public class RoomInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "inventory_date", nullable = false)
    private LocalDate inventoryDate;

    @Column(name = "total_rooms", nullable = false)
    private int totalRooms;

    @Column(name = "booked_rooms", nullable = false)
    private int bookedRooms = 0;

    @Column(name = "available_rooms", nullable = false)
    private int availableRooms;

    @Column(name = "price_override", precision = 10, scale = 2)
    private BigDecimal priceOverride;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public RoomInventory() {}

    public RoomInventory(RoomType roomType, LocalDate inventoryDate, int totalRooms, BigDecimal priceOverride) {
        this.roomType = roomType;
        this.inventoryDate = inventoryDate;
        this.totalRooms = totalRooms;
        this.bookedRooms = 0;
        this.availableRooms = totalRooms;
        this.priceOverride = priceOverride;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean canAccommodate(int count) {
        return this.availableRooms >= count;
    }

    public void reserve(int count) {
        if (!canAccommodate(count)) {
            throw new IllegalStateException("Insufficient room availability for date: " + inventoryDate);
        }
        this.bookedRooms += count;
        this.availableRooms -= count;
    }

    public void release(int count) {
        this.bookedRooms = Math.max(0, this.bookedRooms - count);
        this.availableRooms = Math.min(this.totalRooms, this.totalRooms - this.bookedRooms);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public LocalDate getInventoryDate() {
        return inventoryDate;
    }

    public void setInventoryDate(LocalDate inventoryDate) {
        this.inventoryDate = inventoryDate;
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(int totalRooms) {
        this.totalRooms = totalRooms;
        this.availableRooms = Math.max(0, totalRooms - this.bookedRooms);
    }

    public int getBookedRooms() {
        return bookedRooms;
    }

    public void setBookedRooms(int bookedRooms) {
        this.bookedRooms = bookedRooms;
        this.availableRooms = Math.max(0, this.totalRooms - bookedRooms);
    }

    public int getAvailableRooms() {
        return availableRooms;
    }

    public BigDecimal getPriceOverride() {
        return priceOverride;
    }

    public void setPriceOverride(BigDecimal priceOverride) {
        this.priceOverride = priceOverride;
    }

    public Long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomInventory that = (RoomInventory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
