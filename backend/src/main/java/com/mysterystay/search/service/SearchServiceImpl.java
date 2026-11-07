package com.mysterystay.search.service;

import com.mysterystay.deal.dto.MaskedDealResponse;
import com.mysterystay.deal.service.DealService;
import com.mysterystay.search.dto.BestStayWindowResponse;
import com.mysterystay.search.dto.DealSearchRequest;
import com.mysterystay.search.dto.DealSearchResponse;
import com.mysterystay.search.dsa.InvertedIndexService;
import com.mysterystay.search.dsa.StayWindowOptimizer;
import com.mysterystay.search.dsa.TopKDealRanker;
import com.mysterystay.search.model.ScoredDeal;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class SearchServiceImpl implements SearchService {

    private final DealService dealService;
    private final InvertedIndexService invertedIndexService;
    private final TopKDealRanker topKDealRanker;
    private final StayWindowOptimizer stayWindowOptimizer;

    public SearchServiceImpl(
            DealService dealService,
            InvertedIndexService invertedIndexService,
            TopKDealRanker topKDealRanker,
            StayWindowOptimizer stayWindowOptimizer
    ) {
        this.dealService = dealService;
        this.invertedIndexService = invertedIndexService;
        this.topKDealRanker = topKDealRanker;
        this.stayWindowOptimizer = stayWindowOptimizer;
    }

    @Override
    public DealSearchResponse searchDeals(DealSearchRequest request) {
        long startNanos = System.nanoTime();

        List<MaskedDealResponse> allDeals = dealService.getAllActiveMysteryDeals();

        // 1. Maintain in-memory inverted index
        invertedIndexService.rebuildIndex(allDeals);

        // 2. Multi-Attribute Fast Filter via Inverted Index (HashMap + HashSet intersection)
        Set<Long> matchingIds = invertedIndexService.queryDealIds(
                request.city(),
                request.minStarRating(),
                request.amenities()
        );

        // 3. Filter candidates by matching IDs and price bounds
        List<MaskedDealResponse> candidates = allDeals.stream()
                .filter(deal -> matchingIds == null || matchingIds.contains(deal.dealId()))
                .filter(deal -> request.maxPrice() == null || deal.mysteryPrice().compareTo(request.maxPrice()) <= 0)
                .toList();

        int evaluatedCount = candidates.size();
        List<ScoredDeal> rankedDeals;
        String algorithmUsed;

        // 4. Rank using DSA Bounded Min-Heap or specified comparator
        String sortType = request.sortBy() != null ? request.sortBy().toUpperCase() : "VALUE_SCORE";
        switch (sortType) {
            case "PRICE_ASC" -> {
                rankedDeals = candidates.stream()
                        .sorted(Comparator.comparing(MaskedDealResponse::mysteryPrice))
                        .limit(request.k())
                        .map(d -> topKDealRanker.scoreDeal(d, request.maxPrice() != null ? request.maxPrice().doubleValue() : 500.0))
                        .toList();
                algorithmUsed = "TimSort by Price ASC (Limited to K=" + request.k() + ")";
            }
            case "DISCOUNT_DESC" -> {
                rankedDeals = candidates.stream()
                        .sorted(Comparator.comparingInt(MaskedDealResponse::discountPercent).reversed())
                        .limit(request.k())
                        .map(d -> topKDealRanker.scoreDeal(d, request.maxPrice() != null ? request.maxPrice().doubleValue() : 500.0))
                        .toList();
                algorithmUsed = "TimSort by Discount DESC (Limited to K=" + request.k() + ")";
            }
            default -> {
                rankedDeals = topKDealRanker.rankTopK(candidates, request.k(), request.maxPrice());
                algorithmUsed = "Bounded Min-Heap Top-K (O(N log K)) + Inverted Index Intersection";
            }
        }

        long elapsedMicros = (System.nanoTime() - startNanos) / 1000;

        return new DealSearchResponse(
                rankedDeals,
                evaluatedCount,
                rankedDeals.size(),
                elapsedMicros,
                algorithmUsed
        );
    }

    @Override
    public BestStayWindowResponse findBestStayWindow(Long dealId, int stayLength) {
        long startNanos = System.nanoTime();

        MaskedDealResponse deal = dealService.getMaskedDealById(dealId);

        // Synthesize dynamic calendar rates across deal validity range
        // Standard hospitality pricing: Friday and Saturday nights command a 15% weekend premium
        List<StayWindowOptimizer.DailyRate> dailyRates = new ArrayList<>();
        LocalDate current = deal.validFrom();
        LocalDate end = deal.validTo();

        while (!current.isAfter(end)) {
            BigDecimal rate = deal.mysteryPrice();
            if (current.getDayOfWeek() == DayOfWeek.FRIDAY || current.getDayOfWeek() == DayOfWeek.SATURDAY) {
                rate = rate.multiply(BigDecimal.valueOf(1.15)).setScale(2, RoundingMode.HALF_UP);
            }
            dailyRates.add(new StayWindowOptimizer.DailyRate(current, rate));
            current = current.plusDays(1);
        }

        StayWindowOptimizer.OptimalStayWindow window = stayWindowOptimizer.findBestWindow(dailyRates, stayLength);
        long elapsedMicros = (System.nanoTime() - startNanos) / 1000;

        return new BestStayWindowResponse(
                dealId,
                window.stayLength(),
                window.checkInDate(),
                window.checkOutDate(),
                window.totalCost(),
                window.averageNightlyRate(),
                window.savingsVsWorstWindow(),
                elapsedMicros,
                "Sliding Window O(D) Time, O(1) Space"
        );
    }
}
