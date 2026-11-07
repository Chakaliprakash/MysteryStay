package com.mysterystay.search.dsa;

import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.search.model.ScoredDeal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Top-K Mystery Deal Ranker powered by a Bounded Min-Heap (PriorityQueue).
 *
 * Problem Statement:
 * Given N candidate mystery deals, return the K highest-scoring deals based on a multi-factor
 * value score balancing discount percentage, hotel star quality, and price efficiency.
 *
 * Algorithmic Complexity:
 * - Optimal (Min-Heap): Time O(N log K), Auxiliary Space O(K)
 * - Baseline (Full Sort): Time O(N log N), Space O(N)
 *
 * When N is large (e.g., thousands of deals) and K is small (e.g., top 10),
 * O(N log K) performs significantly fewer comparisons and avoids allocating large sorting buffers.
 */
@Component
public class TopKDealRanker {

    private static final double WEIGHT_DISCOUNT = 0.50;
    private static final double WEIGHT_STARS = 0.30;
    private static final double WEIGHT_PRICE = 0.20;
    private static final double DEFAULT_MAX_BUDGET = 500.0;

    /**
     * Ranks deals using an optimal bounded Min-Heap of size K.
     *
     * @param deals candidate pool of N masked deals
     * @param k number of top deals requested
     * @param budgetCeiling optional budget cap for normalizing price penalty
     * @return top K scored deals sorted in descending order of value score
     */
    public List<ScoredDeal> rankTopK(List<MaskedDealResponse> deals, int k, BigDecimal budgetCeiling) {
        if (deals == null || deals.isEmpty() || k <= 0) {
            return List.of();
        }

        double maxBudget = budgetCeiling != null && budgetCeiling.doubleValue() > 0
                ? budgetCeiling.doubleValue()
                : DEFAULT_MAX_BUDGET;

        // Bounded Min-Heap: the deal with the smallest score stays at the head (peek).
        PriorityQueue<ScoredDeal> minHeap = new PriorityQueue<>(k);

        for (MaskedDealResponse deal : deals) {
            ScoredDeal scored = scoreDeal(deal, maxBudget);

            if (minHeap.size() < k) {
                minHeap.offer(scored);
            } else if (scored.valueScore() > minHeap.peek().valueScore()) {
                minHeap.poll(); // Evict the lowest scoring candidate in the top-K window
                minHeap.offer(scored);
            }
        }

        // Extract elements from min-heap (lowest to highest), then reverse for descending output
        List<ScoredDeal> result = new ArrayList<>(minHeap.size());
        while (!minHeap.isEmpty()) {
            result.add(minHeap.poll());
        }
        Collections.reverse(result);
        return result;
    }

    /**
     * Baseline implementation using Java Streams and full TimSort (O(N log N)).
     * Used for correctness verification and algorithmic performance benchmarking.
     */
    public List<ScoredDeal> rankByFullSort(List<MaskedDealResponse> deals, int k, BigDecimal budgetCeiling) {
        if (deals == null || deals.isEmpty() || k <= 0) {
            return List.of();
        }

        double maxBudget = budgetCeiling != null && budgetCeiling.doubleValue() > 0
                ? budgetCeiling.doubleValue()
                : DEFAULT_MAX_BUDGET;

        return deals.stream()
                .map(deal -> scoreDeal(deal, maxBudget))
                .sorted(Comparator.comparingDouble(ScoredDeal::valueScore).reversed())
                .limit(k)
                .toList();
    }

    /**
     * Calculates composite dynamic value score:
     * ValueScore = (w1 * discountPercent) + (w2 * starRating * 10) - (w3 * (price / maxBudget) * 100)
     */
    public ScoredDeal scoreDeal(MaskedDealResponse deal, double maxBudget) {
        double discountComponent = WEIGHT_DISCOUNT * deal.discountPercent();
        double starComponent = WEIGHT_STARS * (deal.starRating() * 10.0);
        double priceRatio = Math.min(deal.mysteryPrice().doubleValue() / maxBudget, 2.0);
        double pricePenalty = WEIGHT_PRICE * (priceRatio * 100.0);

        double totalScore = Math.round((discountComponent + starComponent - pricePenalty) * 100.0) / 100.0;

        String explanation = String.format(
                "ValueScore: %.2f [Discount(+%.1f%%)=+%.1f, Stars(%d★)=+%.1f, PricePenalty($%.2f)=-%.1f]",
                totalScore, (double) deal.discountPercent(), discountComponent,
                deal.starRating(), starComponent,
                deal.mysteryPrice().doubleValue(), pricePenalty
        );

        return new ScoredDeal(deal, totalScore, explanation);
    }
}
