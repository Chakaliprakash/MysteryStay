package com.mysterystay.search.dto;

import com.mysterystay.search.model.ScoredDeal;

import java.util.List;

/**
 * Encapsulates search results along with DSA execution profiling metrics.
 */
public record DealSearchResponse(
        List<ScoredDeal> deals,
        int totalCandidatesEvaluated,
        int returnedCount,
        long executionTimeMicros,
        String algorithmUsed
) {}
