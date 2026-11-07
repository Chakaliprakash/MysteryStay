package com.mysterystay.search.model;

import com.mysterystay.deal.dto.MaskedDealResponse;

/**
 * Scored deal representation pairing an identity-masked deal with its dynamic value score.
 * Natural ordering is ascending by score to directly back a Min-Heap in PriorityQueue.
 */
public record ScoredDeal(
        MaskedDealResponse deal,
        double valueScore,
        String explanation
) implements Comparable<ScoredDeal> {

    @Override
    public int compareTo(ScoredDeal other) {
        return Double.compare(this.valueScore, other.valueScore);
    }
}
