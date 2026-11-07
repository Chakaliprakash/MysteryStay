package com.mysterystay.search.dsa;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Sliding Window Stay Price Optimizer.
 *
 * Problem Statement:
 * Given a chronological sequence of D daily room rates across a mystery deal's active calendar,
 * find the optimal consecutive stay window of length L (1 <= L <= D) that minimizes total cost.
 *
 * Algorithmic Complexity:
 * - Optimal (Sliding Window): Time O(D), Auxiliary Space O(1)
 * - Brute-Force: Time O((D - L + 1) * L), Auxiliary Space O(1)
 *
 * By maintaining a running sum and shifting the window in O(1) per day (subtracting the exiting day
 * and adding the entering day), we achieve linear time execution irrespective of stay length L.
 */
@Component
public class StayWindowOptimizer {

    public record DailyRate(LocalDate date, BigDecimal price) {}

    public record OptimalStayWindow(
            LocalDate checkInDate,
            LocalDate checkOutDate,
            int stayLength,
            BigDecimal totalCost,
            BigDecimal averageNightlyRate,
            BigDecimal savingsVsWorstWindow
    ) {}

    /**
     * Finds the optimal consecutive stay window using a sliding window algorithm.
     *
     * @param dailyRates chronological list of daily rates (length D)
     * @param stayLength number of consecutive nights (L)
     * @return OptimalStayWindow details
     */
    public OptimalStayWindow findBestWindow(List<DailyRate> dailyRates, int stayLength) {
        if (dailyRates == null || dailyRates.isEmpty()) {
            throw new IllegalArgumentException("Daily rates list cannot be empty.");
        }
        int totalDays = dailyRates.size();
        if (stayLength <= 0 || stayLength > totalDays) {
            throw new IllegalArgumentException(String.format(
                    "Stay length %d is invalid for rate calendar of %d days.", stayLength, totalDays
            ));
        }

        // 1. Compute sum of the first window [0, stayLength - 1] in O(L)
        BigDecimal currentSum = BigDecimal.ZERO;
        for (int i = 0; i < stayLength; i++) {
            currentSum = currentSum.add(dailyRates.get(i).price());
        }

        BigDecimal minSum = currentSum;
        int bestStartIndex = 0;

        BigDecimal maxSum = currentSum;
        int worstStartIndex = 0;

        // 2. Slide the window one day at a time across the remaining (D - L) days in O(1) per step
        for (int i = stayLength; i < totalDays; i++) {
            BigDecimal exitingPrice = dailyRates.get(i - stayLength).price();
            BigDecimal enteringPrice = dailyRates.get(i).price();

            currentSum = currentSum.subtract(exitingPrice).add(enteringPrice);

            if (currentSum.compareTo(minSum) < 0) {
                minSum = currentSum;
                bestStartIndex = i - stayLength + 1;
            }
            if (currentSum.compareTo(maxSum) > 0) {
                maxSum = currentSum;
                worstStartIndex = i - stayLength + 1;
            }
        }

        LocalDate bestCheckIn = dailyRates.get(bestStartIndex).date();
        // Checkout is the morning following the last night of the stay
        LocalDate bestCheckOut = dailyRates.get(bestStartIndex + stayLength - 1).date().plusDays(1);
        BigDecimal averageNightlyRate = minSum.divide(BigDecimal.valueOf(stayLength), 2, RoundingMode.HALF_UP);
        BigDecimal savingsVsWorst = maxSum.subtract(minSum);

        return new OptimalStayWindow(
                bestCheckIn,
                bestCheckOut,
                stayLength,
                minSum,
                averageNightlyRate,
                savingsVsWorst
        );
    }

    /**
     * Brute-force re-summation implementation (O((D - L + 1) * L)).
     * Used for unit testing verification against the sliding window output.
     */
    public OptimalStayWindow findBestWindowBruteForce(List<DailyRate> dailyRates, int stayLength) {
        if (dailyRates == null || dailyRates.isEmpty() || stayLength <= 0 || stayLength > dailyRates.size()) {
            throw new IllegalArgumentException("Invalid input for brute force calculation.");
        }

        int totalDays = dailyRates.size();
        BigDecimal minSum = null;
        int bestStartIndex = 0;

        BigDecimal maxSum = null;

        for (int i = 0; i <= totalDays - stayLength; i++) {
            BigDecimal windowSum = BigDecimal.ZERO;
            for (int j = i; j < i + stayLength; j++) {
                windowSum = windowSum.add(dailyRates.get(j).price());
            }

            if (minSum == null || windowSum.compareTo(minSum) < 0) {
                minSum = windowSum;
                bestStartIndex = i;
            }
            if (maxSum == null || windowSum.compareTo(maxSum) > 0) {
                maxSum = windowSum;
            }
        }

        LocalDate bestCheckIn = dailyRates.get(bestStartIndex).date();
        LocalDate bestCheckOut = dailyRates.get(bestStartIndex + stayLength - 1).date().plusDays(1);
        BigDecimal average = minSum.divide(BigDecimal.valueOf(stayLength), 2, RoundingMode.HALF_UP);
        BigDecimal savings = maxSum.subtract(minSum);

        return new OptimalStayWindow(bestCheckIn, bestCheckOut, stayLength, minSum, average, savings);
    }
}
