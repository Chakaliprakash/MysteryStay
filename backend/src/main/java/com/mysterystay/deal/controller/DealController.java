package com.mysterystay.deal.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.deal.dto.CreateMysteryDealRequest;
import com.mysterystay.deal.dto.ManagerDealResponse;
import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.deal.service.DealService;
import com.mysterystay.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deals")
public class DealController {

    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    /**
     * Public endpoint: Lists all active, identity-masked mystery deals.
     * Guaranteed zero disclosure of hotel name or street address.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaskedDealResponse>>> getAllDeals() {
        List<MaskedDealResponse> deals = dealService.getAllActiveMysteryDeals();
        return ResponseEntity.ok(ApiResponse.success(deals, "Active mystery deals retrieved successfully"));
    }

    /**
     * Public endpoint: Inspect a single identity-masked mystery deal.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaskedDealResponse>> getDealById(@PathVariable Long id) {
        MaskedDealResponse deal = dealService.getMaskedDealById(id);
        return ResponseEntity.ok(ApiResponse.success(deal, "Mystery deal retrieved successfully"));
    }

    /**
     * Manager endpoint: Publish a new mystery deal.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ManagerDealResponse>> createDeal(
            @Valid @RequestBody CreateMysteryDealRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ManagerDealResponse response = dealService.createMysteryDeal(request, principal.getId(), isAdmin);
        return new ResponseEntity<>(ApiResponse.success(response, "Mystery deal published successfully"), HttpStatus.CREATED);
    }

    /**
     * Manager endpoint: View all deals created for my properties.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ManagerDealResponse>>> getMyDeals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ManagerDealResponse> deals = dealService.getMyDeals(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(deals, "Manager deals retrieved successfully"));
    }

    /**
     * Manager endpoint: Activate or pause a mystery deal.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ManagerDealResponse>> toggleDealStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ManagerDealResponse response = dealService.toggleDealStatus(id, active, principal.getId(), isAdmin);
        String msg = active ? "Mystery deal activated" : "Mystery deal paused";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }
}
