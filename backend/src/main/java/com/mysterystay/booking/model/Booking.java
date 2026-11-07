package com.mysterystay.booking.model;

import com.mysterystay.deal.model.MysteryDeal;
import com.mysterystay.hotel.model.Hotel;
import com.mysterystay.inventory.model.RoomType;
import com.mysterystay.user.model.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 36)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mystery_deal_id")
    private MysteryDeal mysteryDeal;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "room_count", nullable = false)
    private int roomCount = 1;

    @Column(name = "adult_count", nullable = false)
    private int adultCount = 1;

    @Column(name = "child_count", nullable = false)
    private int childCount = 0;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(name = "guest_email", nullable = false, length = 150)
    private String guestEmail;

    @Column(name = "guest_phone", nullable = false, length = 20)
    private String guestPhone;

    @Column(name = "nightly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal nightlyRate;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status;

    @Column(name = "identity_revealed", nullable = false)
    private boolean identityRevealed = false;

    @Column(name = "special_requests", length = 500)
    private String specialRequests;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Booking() {}

    public Booking(
            String bookingReference,
            User user,
            Hotel hotel,
            RoomType roomType,
            MysteryDeal mysteryDeal,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            int roomCount,
            int adultCount,
            int childCount,
            String guestName,
            String guestEmail,
            String guestPhone,
            BigDecimal nightlyRate,
            BigDecimal totalAmount,
            Instant expiresAt,
            String specialRequests
    ) {
        this.bookingReference = bookingReference;
        this.user = user;
        this.hotel = hotel;
        this.roomType = roomType;
        this.mysteryDeal = mysteryDeal;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.roomCount = roomCount;
        this.adultCount = adultCount;
        this.childCount = childCount;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.nightlyRate = nightlyRate;
        this.totalAmount = totalAmount;
        this.status = BookingStatus.PENDING_PAYMENT;
        this.identityRevealed = false;
        this.expiresAt = expiresAt;
        this.specialRequests = specialRequests;
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

    public boolean isExpired() {
        return status == BookingStatus.PENDING_PAYMENT && Instant.now().isAfter(expiresAt);
    }

    public void confirm() {
        this.status = BookingStatus.CONFIRMED;
        this.identityRevealed = true;
    }

    public void cancel() {
        this.status = BookingStatus.CANCELLED;
    }

    public void expire() {
        this.status = BookingStatus.EXPIRED;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getBookingReference() { return bookingReference; }
    public User getUser() { return user; }
    public Hotel getHotel() { return hotel; }
    public RoomType getRoomType() { return roomType; }
    public MysteryDeal getMysteryDeal() { return mysteryDeal; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public int getRoomCount() { return roomCount; }
    public int getAdultCount() { return adultCount; }
    public int getChildCount() { return childCount; }
    public String getGuestName() { return guestName; }
    public String getGuestEmail() { return guestEmail; }
    public String getGuestPhone() { return guestPhone; }
    public BigDecimal getNightlyRate() { return nightlyRate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BookingStatus getStatus() { return status; }
    public boolean isIdentityRevealed() { return identityRevealed; }
    public String getSpecialRequests() { return specialRequests; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStatus(BookingStatus status) { this.status = status; }
    public void setIdentityRevealed(boolean identityRevealed) { this.identityRevealed = identityRevealed; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
