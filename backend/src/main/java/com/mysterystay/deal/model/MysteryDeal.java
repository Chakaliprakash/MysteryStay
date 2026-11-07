package com.mysterystay.deal.model;

import com.mysterystay.inventory.model.RoomType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "mystery_deals")
public class MysteryDeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "mystery_title", nullable = false, length = 150)
    private String mysteryTitle;

    @Column(name = "description_clues", nullable = false, columnDefinition = "TEXT")
    private String descriptionClues;

    @Column(name = "discount_percent", nullable = false)
    private int discountPercent;

    @Column(name = "mystery_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal mysteryPrice;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public MysteryDeal() {}

    public MysteryDeal(RoomType roomType, String mysteryTitle, String descriptionClues,
                       int discountPercent, BigDecimal mysteryPrice, LocalDate validFrom, LocalDate validTo) {
        this.roomType = roomType;
        this.mysteryTitle = mysteryTitle;
        this.descriptionClues = descriptionClues;
        this.discountPercent = discountPercent;
        this.mysteryPrice = mysteryPrice;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.active = true;
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

    public boolean isCurrentlyValid() {
        LocalDate today = LocalDate.now();
        return active && !today.isBefore(validFrom) && !today.isAfter(validTo);
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

    public String getMysteryTitle() {
        return mysteryTitle;
    }

    public void setMysteryTitle(String mysteryTitle) {
        this.mysteryTitle = mysteryTitle;
    }

    public String getDescriptionClues() {
        return descriptionClues;
    }

    public void setDescriptionClues(String descriptionClues) {
        this.descriptionClues = descriptionClues;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(int discountPercent) {
        this.discountPercent = discountPercent;
    }

    public BigDecimal getMysteryPrice() {
        return mysteryPrice;
    }

    public void setMysteryPrice(BigDecimal mysteryPrice) {
        this.mysteryPrice = mysteryPrice;
    }

    public LocalDate getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(LocalDate validFrom) {
        this.validFrom = validFrom;
    }

    public LocalDate getValidTo() {
        return validTo;
    }

    public void setValidTo(LocalDate validTo) {
        this.validTo = validTo;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
        MysteryDeal that = (MysteryDeal) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
