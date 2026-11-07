import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowUpDown, 
  LayoutGrid, 
  List as ListIcon,
  Search,
  RotateCcw
} from 'lucide-react';
import MysteryDealCard from '../../components/cards/MysteryDealCard';
import { dsaService } from '../../services/dsaService';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Filter States
  const [city, setCity] = useState(searchParams.get('city') || 'ALL');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || 0);
  const [minDiscount, setMinDiscount] = useState(searchParams.get('minDiscount') || 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 600);
  const [sortBy, setSortBy] = useState('DSA_SCORE');

  useEffect(() => {
    setLoading(true);
    dsaService.searchDeals({
      city: city === 'ALL' ? undefined : city,
      minRating: minRating > 0 ? minRating : undefined,
      minDiscount: minDiscount > 0 ? minDiscount : undefined,
      maxPrice: maxPrice < 600 ? maxPrice : undefined
    }).then((res) => {
      let sorted = [...res];
      if (sortBy === 'PRICE_ASC') {
        sorted.sort((a, b) => a.mysteryPrice - b.mysteryPrice);
      } else if (sortBy === 'DISCOUNT_DESC') {
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
      } else if (sortBy === 'RATING_DESC') {
        sorted.sort((a, b) => b.starRating - a.starRating);
      } else {
        // DSA Value Score: (discountPercent * 1.5) + (starRating * 10) - (price * 0.05)
        sorted.sort((a, b) => {
          const scoreA = (a.discountPercent * 1.5) + (a.starRating * 10) - (a.mysteryPrice * 0.05);
          const scoreB = (b.discountPercent * 1.5) + (b.starRating * 10) - (b.mysteryPrice * 0.05);
          return scoreB - scoreA;
        });
      }
      setDeals(sorted);
      setLoading(false);
    });
  }, [city, minRating, minDiscount, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setCity('ALL');
    setMinRating(0);
    setMinDiscount(0);
    setMaxPrice(600);
    setSortBy('DSA_SCORE');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Inverted Index Discovery
          </span>
          <h1 className="font-editorial text-4xl text-[#14251F] font-normal">
            Mystery Hotel Stays
          </h1>
          <p className="text-xs text-[#5A626A] mt-1">
            Displaying {deals.length} verified five-star mystery offers matching your criteria.
          </p>
        </div>

        {/* Sorting & View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E4DFD5] text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span className="text-[#5A626A] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-[#14251F] focus:outline-none cursor-pointer"
            >
              <option value="DSA_SCORE">Top Value Score (DSA Ranker)</option>
              <option value="PRICE_ASC">Lowest Mystery Price</option>
              <option value="DISCOUNT_DESC">Highest Discount %</option>
              <option value="RATING_DESC">Star Rating</option>
            </select>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E4DFD5]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#14251F] text-white' : 'text-[#5A626A]'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#14251F] text-white' : 'text-[#5A626A]'}`}
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-[#E4DFD5] p-6 space-y-6 shadow-luxury">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#14251F]">
              <Filter className="w-4 h-4 text-[#C6A66B]" />
              Filter Stays
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#8C6D32] hover:text-[#14251F] flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5A626A]">
              Destination
            </label>
            <div className="space-y-1">
              {['ALL', 'Bangalore', 'Mumbai', 'Goa', 'Delhi'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    city === c
                      ? 'bg-[#14251F] text-white font-bold'
                      : 'hover:bg-[#F8F6F0] text-[#14251F]'
                  }`}
                >
                  {c === 'ALL' ? 'All Destinations' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Slider */}
          <div className="space-y-2 border-t border-[#EFECE4] pt-4">
            <div className="flex justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#5A626A]">Min. Discount</span>
              <span className="font-bold text-[#0D8A5E]">{minDiscount}% OFF</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
              className="w-full accent-[#C6A66B] cursor-pointer"
            />
          </div>

          {/* Price Ceiling */}
          <div className="space-y-2 border-t border-[#EFECE4] pt-4">
            <div className="flex justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#5A626A]">Max Nightly Rate</span>
              <span className="font-bold text-[#14251F]">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C6A66B] cursor-pointer"
            />
          </div>
        </aside>

        {/* Results Grid / List */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-[#E4DFD5] p-6 space-y-4 animate-pulse">
                  <div className="aspect-[16/10] bg-[#EFECE4] rounded-2xl" />
                  <div className="h-4 bg-[#EFECE4] rounded w-3/4" />
                  <div className="h-3 bg-[#EFECE4] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E4DFD5] p-8 space-y-4">
              <Search className="w-10 h-10 text-[#5A626A]/40 mx-auto" />
              <h3 className="font-editorial text-2xl text-[#14251F]">No mystery deals match your filter</h3>
              <p className="text-xs text-[#5A626A]">Try expanding your price range or clearing specific filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#14251F] text-white text-xs font-semibold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {deals.map((deal) => (
                <MysteryDealCard key={deal.dealId} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
