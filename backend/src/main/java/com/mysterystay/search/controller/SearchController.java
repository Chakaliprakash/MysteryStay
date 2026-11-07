package com.mysterystay.search.controller;

import com.mysterystay.common.response.ApiResponse;
import com.mysterystay.search.dto.BestStayWindowResponse;
import com.mysterystay.search.dto.DealSearchRequest;
import com.mysterystay.search.dto.DealSearchResponse;
import com.mysterystay.search.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Public search & recommendation endpoint powered by:
     * 1. Multi-attribute Inverted Index (HashMap + HashSet)
     * 2. Bounded Min-Heap Top-K Ranker (PriorityQueue)
     */
    @GetMapping("/deals")
    public ResponseEntity<ApiResponse<DealSearchResponse>> searchDeals(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false, defaultValue = "10") Integer k,
            @RequestParam(required = false, defaultValue = "VALUE_SCORE") String sortBy
    ) {
        DealSearchRequest request = new DealSearchRequest(city, minRating, maxPrice, amenities, k, sortBy);
        DealSearchResponse response = searchService.searchDeals(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Mystery deals ranked successfully"));
    }

    /**
     * Sliding Window Calendar Price Optimizer:
     * Identifies the optimal consecutive check-in date minimizing total guest cost.
     */
    @GetMapping("/deals/{dealId}/best-window")
    public ResponseEntity<ApiResponse<BestStayWindowResponse>> getBestStayWindow(
            @PathVariable Long dealId,
            @RequestParam(required = false, defaultValue = "3") int stayLength
    ) {
        BestStayWindowResponse response = searchService.findBestStayWindow(dealId, stayLength);
        return ResponseEntity.ok(ApiResponse.success(response, "Optimal stay window computed successfully"));
    }
}
