package com.mysterystay.search.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Filter and ranking criteria for searching mystery deals.
 */
public record DealSearchRequest(
        String city,
        Integer minStarRating,
        BigDecimal maxPrice,
        List<String> amenities,
        Integer k,
        String sortBy
) {
    public DealSearchRequest {
        if (k == null || k <= 0) {
            k = 10;
        }
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "VALUE_SCORE";
        }
    }
}
