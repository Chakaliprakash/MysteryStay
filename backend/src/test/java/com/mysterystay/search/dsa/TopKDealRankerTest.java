package com.mysterystay.search.dsa;

import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.search.model.ScoredDeal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TopKDealRankerTest {

    private TopKDealRanker ranker;

    @BeforeEach
    void setUp() {
        ranker = new TopKDealRanker();
    }

    private MaskedDealResponse createDeal(Long id, int starRating, int discount, double mysteryPrice) {
        return new MaskedDealResponse(
                id,
                "Mystery Hotel " + id,
                "Luxury clue description",
                "Bangalore",
                "Indiranagar",
                starRating,
                "DELUXE",
                2,
                1,
                BigDecimal.valueOf(mysteryPrice / (1.0 - discount / 100.0)),
                BigDecimal.valueOf(mysteryPrice),
                discount,
                List.of("Infinity Pool", "Spa & Wellness"),
                LocalDate.now(),
                LocalDate.now().plusDays(14)
        );
    }

    @Test
    @DisplayName("Bounded Min-Heap yields identical top-K results to full sort O(N log N)")
    void rankTopK_shouldMatchFullSortBaseline() {
        List<MaskedDealResponse> deals = new ArrayList<>();
        // Create 20 diverse deals
        for (long i = 1; i <= 20; i++) {
            int stars = 3 + (int) (i % 3); // 3, 4, 5 stars
            int discount = 20 + (int) (i * 2); // 22% to 60%
            double price = 100.0 + (i * 15.0); // $115 to $400
            deals.add(createDeal(i, stars, discount, price));
        }

        int k = 5;
        List<ScoredDeal> heapResult = ranker.rankTopK(deals, k, BigDecimal.valueOf(500));
        List<ScoredDeal> sortResult = ranker.rankByFullSort(deals, k, BigDecimal.valueOf(500));

        assertThat(heapResult).hasSize(k);
        assertThat(sortResult).hasSize(k);

        // Scores and IDs must match element by element
        for (int i = 0; i < k; i++) {
            assertThat(heapResult.get(i).deal().dealId()).isEqualTo(sortResult.get(i).deal().dealId());
            assertThat(heapResult.get(i).valueScore()).isEqualTo(sortResult.get(i).valueScore());
        }

        // Verify strictly descending order
        for (int i = 0; i < k - 1; i++) {
            assertThat(heapResult.get(i).valueScore()).isGreaterThanOrEqualTo(heapResult.get(i + 1).valueScore());
        }
    }

    @Test
    @DisplayName("Edge Case: K >= N gracefully returns all N candidates sorted descending")
    void rankTopK_whenKExceedsN_returnsAllElementsSorted() {
        List<MaskedDealResponse> deals = List.of(
                createDeal(1L, 3, 20, 200.0),
                createDeal(2L, 5, 50, 150.0),
                createDeal(3L, 4, 35, 180.0)
        );

        List<ScoredDeal> result = ranker.rankTopK(deals, 10, BigDecimal.valueOf(500));

        assertThat(result).hasSize(3);
        assertThat(result.get(0).deal().dealId()).isEqualTo(2L); // 5 stars, 50% discount, $150
        assertThat(result.get(0).valueScore()).isGreaterThan(result.get(1).valueScore());
        assertThat(result.get(1).valueScore()).isGreaterThan(result.get(2).valueScore());
    }

    @Test
    @DisplayName("Edge Case: Empty candidates or K <= 0 returns empty list")
    void rankTopK_emptyOrInvalidK_returnsEmptyList() {
        assertThat(ranker.rankTopK(List.of(), 5, BigDecimal.valueOf(500))).isEmpty();
        assertThat(ranker.rankTopK(null, 5, BigDecimal.valueOf(500))).isEmpty();

        List<MaskedDealResponse> deals = List.of(createDeal(1L, 4, 30, 200.0));
        assertThat(ranker.rankTopK(deals, 0, BigDecimal.valueOf(500))).isEmpty();
        assertThat(ranker.rankTopK(deals, -1, BigDecimal.valueOf(500))).isEmpty();
    }

    @Test
    @DisplayName("Score calculation adheres to mathematical formula")
    void scoreDeal_computesCorrectCompositeScore() {
        MaskedDealResponse deal = createDeal(1L, 5, 50, 250.0);
        // Formula: (0.5 * 50) + (0.3 * 50) - (0.2 * (250 / 500) * 100)
        // = 25.0 + 15.0 - (0.2 * 50.0)
        // = 40.0 - 10.0 = 30.00
        ScoredDeal scored = ranker.scoreDeal(deal, 500.0);

        assertThat(scored.valueScore()).isEqualTo(30.00);
        assertThat(scored.explanation()).contains("ValueScore: 30.00");
    }
}
