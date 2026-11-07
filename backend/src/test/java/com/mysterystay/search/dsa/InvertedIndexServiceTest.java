package com.mysterystay.search.dsa;

import com.mysterystay.deal.dto.MaskedDealResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class InvertedIndexServiceTest {

    private InvertedIndexService indexService;

    @BeforeEach
    void setUp() {
        indexService = new InvertedIndexService();
    }

    private MaskedDealResponse createDeal(Long id, String city, int stars, List<String> amenities) {
        return new MaskedDealResponse(
                id,
                "Title " + id,
                "Description",
                city,
                "Zone",
                stars,
                "DELUXE",
                2,
                1,
                BigDecimal.valueOf(200),
                BigDecimal.valueOf(140),
                30,
                amenities,
                LocalDate.now(),
                LocalDate.now().plusDays(10)
        );
    }

    @Test
    @DisplayName("Inverted Index builds and answers multi-attribute queries with set intersection")
    void queryDealIds_multiAttributeSetIntersection() {
        MaskedDealResponse d1 = createDeal(1L, "Bangalore", 5, List.of("Infinity Pool", "Spa & Wellness", "Free WiFi"));
        MaskedDealResponse d2 = createDeal(2L, "Bangalore", 4, List.of("Infinity Pool", "Free WiFi"));
        MaskedDealResponse d3 = createDeal(3L, "Mumbai", 5, List.of("Infinity Pool", "Spa & Wellness"));
        MaskedDealResponse d4 = createDeal(4L, "Bangalore", 3, List.of("Free WiFi"));

        indexService.rebuildIndex(List.of(d1, d2, d3, d4));

        // Query: Bangalore + Min 4 Stars + Infinity Pool
        // d1: Bangalore, 5 stars, Infinity Pool -> MATCH
        // d2: Bangalore, 4 stars, Infinity Pool -> MATCH
        // d3: Mumbai -> MISMATCH
        // d4: 3 stars -> MISMATCH
        Set<Long> result = indexService.queryDealIds("Bangalore", 4, List.of("Infinity Pool"));
        assertThat(result).containsExactlyInAnyOrder(1L, 2L);

        // Query: Bangalore + Min 4 Stars + Spa & Wellness
        // Only d1 has Spa & Wellness
        Set<Long> spaResult = indexService.queryDealIds("Bangalore", 4, List.of("Spa & Wellness"));
        assertThat(spaResult).containsExactly(1L);
    }

    @Test
    @DisplayName("Fast-fail when a required amenity does not exist anywhere")
    void queryDealIds_nonExistentAmenity_returnsEmptySet() {
        MaskedDealResponse d1 = createDeal(1L, "Bangalore", 5, List.of("Free WiFi"));
        indexService.rebuildIndex(List.of(d1));

        Set<Long> result = indexService.queryDealIds("Bangalore", null, List.of("Helipad"));
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Empty filter parameters returns null representing unfiltered match")
    void queryDealIds_noFilterSupplied_returnsNull() {
        MaskedDealResponse d1 = createDeal(1L, "Bangalore", 5, List.of("Free WiFi"));
        indexService.rebuildIndex(List.of(d1));

        Set<Long> result = indexService.queryDealIds(null, null, null);
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Incremental add and remove operations update posting lists correctly")
    void indexDeal_and_removeDeal_updatesState() {
        MaskedDealResponse d1 = createDeal(1L, "Goa", 5, List.of("Private Beach"));
        indexService.indexDeal(d1);

        assertThat(indexService.queryDealIds("Goa", null, List.of("Private Beach"))).containsExactly(1L);

        indexService.removeDeal(1L);
        assertThat(indexService.queryDealIds("Goa", null, List.of("Private Beach"))).isEmpty();
    }
}
