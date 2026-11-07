import api from './api';
import { MOCK_CURATED_DEALS } from './dealService';

export const dsaService = {
  /**
   * Search using Multi-Attribute Inverted Index logic
   */
  async searchDeals(params = {}) {
    try {
      const response = await api.get('/search/deals', { params });
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback local DSA inverted index filter
    }

    const { city, minRating, minDiscount, maxPrice } = params;
    let results = [...MOCK_CURATED_DEALS];

    if (city && city !== 'ALL') {
      results = results.filter(d => d.city.toLowerCase() === city.toLowerCase());
    }
    if (minRating) {
      results = results.filter(d => d.starRating >= Number(minRating));
    }
    if (minDiscount) {
      results = results.filter(d => d.discountPercent >= Number(minDiscount));
    }
    if (maxPrice) {
      results = results.filter(d => d.mysteryPrice <= Number(maxPrice));
    }

    return results;
  },

  /**
   * Sliding Window Stay Price Optimizer
   */
  async getBestStayWindow(dealId, stayLength = 3) {
    try {
      const response = await api.get(`/search/deals/${dealId}/best-window`, {
        params: { stayLength }
      });
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback local sliding window calculation
    }

    // Deterministic simulation for 14-day calendar
    const baseRates = [240, 260, 290, 310, 350, 220, 210, 205, 205, 230, 280, 320, 240, 225];
    let minSum = Infinity;
    let bestStart = 0;
    let windowSum = 0;

    for (let i = 0; i < stayLength; i++) {
      windowSum += baseRates[i];
    }
    minSum = windowSum;

    for (let i = stayLength; i < baseRates.length; i++) {
      windowSum += baseRates[i] - baseRates[i - stayLength];
      if (windowSum < minSum) {
        minSum = windowSum;
        bestStart = i - stayLength + 1;
      }
    }

    return {
      dealId,
      stayLength,
      bestStartDate: new Date(Date.now() + bestStart * 86400000).toISOString().split('T')[0],
      bestEndDate: new Date(Date.now() + (bestStart + stayLength) * 86400000).toISOString().split('T')[0],
      totalOptimizedCost: minSum,
      averageNightlyRate: (minSum / stayLength).toFixed(2),
      calendarPrices: baseRates.map((price, idx) => ({
        dayIndex: idx + 1,
        date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
        price,
        inOptimalWindow: idx >= bestStart && idx < bestStart + stayLength
      }))
    };
  }
};
