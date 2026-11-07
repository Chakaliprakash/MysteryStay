import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Star, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';

export const MysteryDealCard = ({ deal, onOptimizeClick }) => {
  const {
    dealId,
    mysteryTitle,
    descriptionClues,
    city,
    zoneArea,
    starRating = 5,
    roomCategory,
    originalPrice,
    mysteryPrice,
    discountPercent,
    savingsAmount,
    imageUrl,
    amenityClues = []
  } = deal;

  return (
    <div className="group bg-white rounded-3xl border border-[#E4DFD5] overflow-hidden luxury-card-hover flex flex-col h-full">
      {/* High-Resolution Photo Container with Secret Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#14251F]">
        <img
          src={imageUrl}
          alt="Mystery Luxury Stay"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14251F]/90 backdrop-blur-md text-[#F8F6F0] text-xs font-semibold border border-[#C6A66B]/40 shadow-sm">
            <Lock className="w-3 h-3 text-[#C6A66B]" />
            Secret Identity
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0D8A5E] text-white text-xs font-bold tracking-tight shadow-sm">
            <TrendingDown className="w-3.5 h-3.5" />
            {discountPercent}% OFF
          </span>
        </div>

        {/* Bottom Photo Metadata */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-lg">
            {city} • {zoneArea}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#DFCA9E]">
            <Star className="w-3.5 h-3.5 fill-[#C6A66B] text-[#C6A66B]" />
            {starRating}.0 Luxury
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Room Category Pill */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66B] bg-[#F4EEDA] px-2 py-0.5 rounded-md">
              {roomCategory?.replace('_', ' ') || 'LUXURY SUITE'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-editorial text-xl text-[#14251F] leading-snug group-hover:text-[#B5955A] transition-colors">
            {mysteryTitle}
          </h3>

          {/* Clues Summary */}
          <p className="text-xs text-[#5A626A] line-clamp-2 leading-relaxed">
            {descriptionClues}
          </p>

          {/* Amenity Clue Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {amenityClues.slice(0, 3).map((clue, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-[#14251F] bg-[#F8F6F0] border border-[#E4DFD5] px-2.5 py-0.5 rounded-lg"
              >
                {clue}
              </span>
            ))}
            {amenityClues.length > 3 && (
              <span className="text-[11px] text-[#5A626A] py-0.5 px-1">
                +{amenityClues.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="pt-6 mt-4 border-t border-[#EFECE4] flex items-end justify-between">
          <div>
            <div className="text-[11px] text-[#5A626A] line-through font-medium">
              Retail ${Number(originalPrice).toFixed(2)}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#14251F] font-editorial tabular-nums">
                ${Number(mysteryPrice).toFixed(2)}
              </span>
              <span className="text-xs text-[#5A626A]">/ night</span>
            </div>
            <div className="text-[11px] font-semibold text-[#0D8A5E]">
              Save ${Number(savingsAmount || (originalPrice - mysteryPrice)).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOptimizeClick && (
              <button
                type="button"
                onClick={() => onOptimizeClick(deal)}
                className="p-2.5 rounded-xl border border-[#C6A66B]/50 hover:bg-[#F4EEDA] text-[#8C6D32] transition-colors"
                title="Sliding Window Price Optimizer (DSA)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <Link
              to={`/deals/${dealId}`}
              className="px-4 py-2.5 rounded-xl bg-[#14251F] hover:bg-[#1A2F27] text-[#F8F6F0] text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-luxury"
            >
              Reserve <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MysteryDealCard;
