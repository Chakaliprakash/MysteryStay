package com.mysterystay.booking.controller;

import com.mysterystay.booking.dto.BookingResponse;
import com.mysterystay.booking.dto.CreateBookingRequest;
import com.mysterystay.booking.service.BookingService;
import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Traveler initiates a booking.
     * Executes atomic pessimistic lock on room inventory with 15-minute hold.
     * Hotel identity is masked in response.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        BookingResponse response = bookingService.createBooking(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success(response, "Booking created successfully with 15-minute hold"), HttpStatus.CREATED);
    }

    /**
     * Inspect booking details by reference.
     */
    @GetMapping("/{reference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByReference(
            @PathVariable String reference,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = isAdmin(principal);
        BookingResponse response = bookingService.getBookingByReference(reference, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking retrieved successfully"));
    }

    /**
     * Lists all bookings belonging to the authenticated traveler.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<BookingResponse> bookings = bookingService.getMyBookings(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings, "My bookings retrieved successfully"));
    }

    /**
     * Confirms booking and reveals the secret hotel identity.
     */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = isAdmin(principal);
        BookingResponse response = bookingService.confirmBooking(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking confirmed! Secret hotel identity revealed."));
    }

    /**
     * Cancels booking and releases held room capacity back to the inventory ledger.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = isAdmin(principal);
        BookingResponse response = bookingService.cancelBooking(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully and inventory released"));
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
