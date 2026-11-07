package com.mysterystay.search.dsa;

import com.mysterystay.deal.dto.MaskedDealResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Multi-Attribute Inverted Index backed by HashMaps and HashSets.
 *
 * Problem Statement:
 * Given thousands of mystery hotel deals, filter candidate deal IDs that simultaneously satisfy
 * multiple criteria (target city, minimum star rating, and specific luxury amenity clues like
 * 'Infinity Pool' or 'Spa') without repetitive, expensive full-table scans.
 *
 * Algorithmic Complexity:
 * - Build Index: O(N * A) where N is number of deals and A is attributes per deal.
 * - Query (Set Intersection Optimization): O(min(|S1|, |S2|, ..., |Sm|)) by ordering sets by
 *   cardinality ascending and intersecting against the smallest set first.
 * - Auxiliary Space: O(N * A) for posting lists.
 */
@Service
public class InvertedIndexService {

    private final Map<String, Set<Long>> cityIndex = new ConcurrentHashMap<>();
    private final Map<Integer, Set<Long>> starRatingIndex = new ConcurrentHashMap<>();
    private final Map<String, Set<Long>> amenityIndex = new ConcurrentHashMap<>();

    /**
     * Rebuilds the in-memory inverted indices from scratch given a collection of deals.
     */
    public synchronized void rebuildIndex(Collection<MaskedDealResponse> deals) {
        cityIndex.clear();
        starRatingIndex.clear();
        amenityIndex.clear();

        if (deals == null) {
            return;
        }

        for (MaskedDealResponse deal : deals) {
            indexDeal(deal);
        }
    }

    /**
     * Incrementally indexes a single deal.
     */
    public void indexDeal(MaskedDealResponse deal) {
        if (deal == null || deal.dealId() == null) {
            return;
        }
        Long id = deal.dealId();

        // 1. City posting list
        if (deal.city() != null) {
            String cityKey = normalize(deal.city());
            cityIndex.computeIfAbsent(cityKey, k -> ConcurrentHashMap.newKeySet()).add(id);
        }

        // 2. Star rating posting list
        starRatingIndex.computeIfAbsent(deal.starRating(), k -> ConcurrentHashMap.newKeySet()).add(id);

        // 3. Amenity clue posting lists
        if (deal.amenityClues() != null) {
            for (String amenity : deal.amenityClues()) {
                String amenityKey = normalize(amenity);
                amenityIndex.computeIfAbsent(amenityKey, k -> ConcurrentHashMap.newKeySet()).add(id);
            }
        }
    }

    /**
     * Removes a deal from all posting lists.
     */
    public void removeDeal(Long dealId) {
        if (dealId == null) {
            return;
        }
        cityIndex.values().forEach(set -> set.remove(dealId));
        starRatingIndex.values().forEach(set -> set.remove(dealId));
        amenityIndex.values().forEach(set -> set.remove(dealId));
    }

    /**
     * Finds matching deal IDs using optimal set intersection ordering.
     *
     * @param city target city (null/blank to ignore)
     * @param minStarRating minimum star rating (null to ignore)
     * @param requiredAmenities list of required amenity clues (null/empty to ignore)
     * @return Set of matching deal IDs, or null if no criteria were provided (meaning all deals match)
     */
    public Set<Long> queryDealIds(String city, Integer minStarRating, List<String> requiredAmenities) {
        List<Set<Long>> candidateSets = new ArrayList<>();

        // 1. Filter by City
        if (city != null && !city.isBlank()) {
            Set<Long> inCity = cityIndex.get(normalize(city));
            if (inCity == null || inCity.isEmpty()) {
                return Collections.emptySet(); // Fast-fail: no deals in this city
            }
            candidateSets.add(inCity);
        }

        // 2. Filter by Minimum Star Rating
        if (minStarRating != null && minStarRating > 0) {
            Set<Long> matchingStars = new HashSet<>();
            for (Map.Entry<Integer, Set<Long>> entry : starRatingIndex.entrySet()) {
                if (entry.getKey() >= minStarRating) {
                    matchingStars.addAll(entry.getValue());
                }
            }
            if (matchingStars.isEmpty()) {
                return Collections.emptySet(); // Fast-fail
            }
            candidateSets.add(matchingStars);
        }

        // 3. Filter by Required Amenities (AND intersection)
        if (requiredAmenities != null && !requiredAmenities.isEmpty()) {
            for (String amenity : requiredAmenities) {
                if (amenity == null || amenity.isBlank()) {
                    continue;
                }
                Set<Long> withAmenity = amenityIndex.get(normalize(amenity));
                if (withAmenity == null || withAmenity.isEmpty()) {
                    return Collections.emptySet(); // Fast-fail: required amenity not found on any deal
                }
                candidateSets.add(withAmenity);
            }
        }

        // If no filter criteria were supplied, return null to indicate unfiltered selection
        if (candidateSets.isEmpty()) {
            return null;
        }

        // OPTIMAL SET INTERSECTION:
        // Sort sets by size ascending: S1 <= S2 <= ... <= Sm
        // Intersect starting with the smallest set to minimize membership lookups O(min(|S1|...|Sm|))
        candidateSets.sort(Comparator.comparingInt(Set::size));

        Set<Long> result = new HashSet<>(candidateSets.get(0));
        for (int i = 1; i < candidateSets.size(); i++) {
            result.retainAll(candidateSets.get(i));
            if (result.isEmpty()) {
                break; // Short-circuit if intersection becomes empty
            }
        }

        return result;
    }

    public int getIndexedDealCount() {
        Set<Long> all = new HashSet<>();
        cityIndex.values().forEach(all::addAll);
        return all.size();
    }

    private String normalize(String str) {
        return str.trim().toLowerCase(Locale.ROOT);
    }
}
