package com.mysterystay.search.dsa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StayWindowOptimizerTest {

    private StayWindowOptimizer optimizer;

    @BeforeEach
    void setUp() {
        optimizer = new StayWindowOptimizer();
    }

    private List<StayWindowOptimizer.DailyRate> generateRates(double... prices) {
        LocalDate start = LocalDate.of(2026, 6, 1);
        List<StayWindowOptimizer.DailyRate> list = new ArrayList<>();
        for (int i = 0; i < prices.length; i++) {
            list.add(new StayWindowOptimizer.DailyRate(start.plusDays(i), BigDecimal.valueOf(prices[i])));
        }
        return list;
    }

    @Test
    @DisplayName("Sliding window produces exact same optimal window as O(D*L) brute-force")
    void findBestWindow_matchesBruteForce() {
        // 10 days of variable rates with a low dip on days 3, 4, 5 (indices 2, 3, 4)
        List<StayWindowOptimizer.DailyRate> rates = generateRates(
                200.0, 210.0, 110.0, 105.0, 115.0, 250.0, 260.0, 190.0, 180.0, 220.0
        );

        int stayLength = 3;
        StayWindowOptimizer.OptimalStayWindow sliding = optimizer.findBestWindow(rates, stayLength);
        StayWindowOptimizer.OptimalStayWindow brute = optimizer.findBestWindowBruteForce(rates, stayLength);

        assertThat(sliding.totalCost()).isEqualByComparingTo(brute.totalCost());
        assertThat(sliding.checkInDate()).isEqualTo(brute.checkInDate());
        assertThat(sliding.checkOutDate()).isEqualTo(brute.checkOutDate());
        assertThat(sliding.averageNightlyRate()).isEqualByComparingTo(brute.averageNightlyRate());
        assertThat(sliding.savingsVsWorstWindow()).isEqualByComparingTo(brute.savingsVsWorstWindow());

        // Dip: 110 + 105 + 115 = 330.00 total
        assertThat(sliding.totalCost()).isEqualByComparingTo(BigDecimal.valueOf(330.0));
        assertThat(sliding.checkInDate()).isEqualTo(LocalDate.of(2026, 6, 3));
        assertThat(sliding.checkOutDate()).isEqualTo(LocalDate.of(2026, 6, 6));
    }

    @Test
    @DisplayName("Edge Case: L = D (stay length equals total calendar duration)")
    void findBestWindow_whenStayLengthEqualsTotalDays() {
        List<StayWindowOptimizer.DailyRate> rates = generateRates(100.0, 120.0, 140.0);
        StayWindowOptimizer.OptimalStayWindow result = optimizer.findBestWindow(rates, 3);

        assertThat(result.totalCost()).isEqualByComparingTo(BigDecimal.valueOf(360.0));
        assertThat(result.checkInDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(result.checkOutDate()).isEqualTo(LocalDate.of(2026, 6, 4));
        assertThat(result.savingsVsWorstWindow()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Edge Case: L = 1 (single day stay window)")
    void findBestWindow_whenStayLengthIsOne() {
        List<StayWindowOptimizer.DailyRate> rates = generateRates(250.0, 180.0, 300.0, 150.0, 220.0);
        StayWindowOptimizer.OptimalStayWindow result = optimizer.findBestWindow(rates, 1);

        assertThat(result.totalCost()).isEqualByComparingTo(BigDecimal.valueOf(150.0));
        assertThat(result.checkInDate()).isEqualTo(LocalDate.of(2026, 6, 4));
        assertThat(result.checkOutDate()).isEqualTo(LocalDate.of(2026, 6, 5));
    }

    @Test
    @DisplayName("Edge Case: L > D or L <= 0 throws IllegalArgumentException")
    void findBestWindow_invalidStayLength_throwsException() {
        List<StayWindowOptimizer.DailyRate> rates = generateRates(100.0, 120.0);

        assertThatThrownBy(() -> optimizer.findBestWindow(rates, 3))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> optimizer.findBestWindow(rates, 0))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
