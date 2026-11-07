import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Users, 
  ArrowRight,
  TrendingDown,
  Check,
  Building,
  Info
} from 'lucide-react';
import { dealService } from '../../services/dealService';
import { dsaService } from '../../services/dsaService';

export const DealDetailPage = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [optimizer, setOptimizer] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);

  useEffect(() => {
    dealService.getDealById(dealId).then((data) => {
      setDeal(data);
      // Auto-populate tomorrow and 3 days later
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const checkoutDate = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
      setCheckIn(tomorrow);
      setCheckOut(checkoutDate);

      // Fetch sliding window recommendations
      dsaService.getBestStayWindow(dealId, 3).then(setOptimizer);
    });
  }, [dealId]);

  if (!deal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EFECE4] rounded w-1/3 mx-auto" />
          <div className="h-4 bg-[#EFECE4] rounded w-1/4 mx-auto" />
        </div>
      </div>
    );
  }

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 3);
  const subtotal = deal.mysteryPrice * nights * rooms;
  const retailTotal = deal.originalPrice * nights * rooms;
  const totalSavings = retailTotal - subtotal;

  const handleProceedToBooking = () => {
    navigate(`/checkout/${dealId}`, {
      state: {
        deal,
        checkIn,
        checkOut,
        rooms,
        adults,
        nights,
        subtotal
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumb & Secret Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5A626A] mb-2">
            <Link to="/" className="hover:text-[#14251F]">Home</Link>
            <span>/</span>
            <Link to="/search" className="hover:text-[#14251F]">Destinations</Link>
            <span>/</span>
            <span className="text-[#14251F] font-semibold">{deal.city}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl text-[#14251F]">
            {deal.mysteryTitle}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-[#5A626A]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#8C6D32]">
              <Star className="w-3.5 h-3.5 fill-[#C6A66B] text-[#C6A66B]" />
              {deal.starRating}.0 Luxury Tier
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
              {deal.city} • {deal.zoneArea}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14251F] text-white text-xs font-semibold border border-[#C6A66B]/30 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#C6A66B]" />
            Identity Masked Until Booking
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0D8A5E] text-white text-xs font-bold shadow-sm">
            <TrendingDown className="w-3.5 h-3.5" />
            {deal.discountPercent}% OFF
          </span>
        </div>
      </div>

      {/* Editorial Image Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#14251F] border border-[#E4DFD5]">
          <img
            src={deal.imageUrl}
            alt="Luxury Stay Dossier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66B] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
              Confidential Property Clue
            </span>
            <p className="text-xs text-white/80 max-w-xl">
              Authentic architecture and pool photograph. Exact brand signage blurred to uphold rate parity compliance.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#14251F] text-white p-6 rounded-3xl border border-[#C6A66B]/30 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#C6A66B] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                The MysteryStay Guarantee
              </div>
              <h3 className="font-editorial text-2xl text-white">
                Guaranteed 5-Star Standards
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                If the unmasked property fails to meet certified 5-star hospitality benchmarks or amenity clues upon reveal, receive a 100% instant refund before check-in.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 text-xs text-[#DFCA9E] flex items-center justify-between">
              <span>Rate Parity Protected</span>
              <span>Pessimistic DB Locks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Booking Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Dossier Details */}
        <div className="lg:col-span-8 space-y-10">
          {/* Architectural Clues & Dossier */}
          <section className="space-y-4">
            <h2 className="font-editorial text-2xl text-[#14251F]">
              Property Clues & Experience Dossier
            </h2>
            <p className="text-sm text-[#1C1F24] leading-relaxed">
              {deal.descriptionClues}
            </p>
          </section>

          {/* Included Luxury Amenities */}
          <section className="space-y-4 border-t border-[#E4DFD5] pt-8">
            <h2 className="font-editorial text-2xl text-[#14251F]">
              Curated Privé Inclusions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(deal.amenityClues || [
                'Complimentary High-Tea',
                '24-Hour Butler Service',
                'Airport Limousine Transfer',
                'Lagoon Swimming Pool',
                'Marble En-Suite Bath',
                'Daily Artisanal Breakfast'
              ]).map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E4DFD5] text-xs font-semibold text-[#14251F]"
                >
                  <Check className="w-4 h-4 text-[#0D8A5E] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DSA Sliding Window Price Optimizer Insight */}
          {optimizer && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C6A66B]/40 shadow-luxury space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C6A66B]" />
                  <h3 className="font-editorial text-xl text-[#14251F]">
                    DSA Sliding Window Stay Recommendation
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#C6A66B] bg-[#F4EEDA] px-2.5 py-1 rounded-full uppercase">
                  O(D) Optimization
                </span>
              </div>
              <p className="text-xs text-[#5A626A]">
                Our calendar window optimizer evaluated 14 contiguous check-in dates for this suite. The cheapest 3-night window begins on <strong className="text-[#14251F]">{optimizer.bestStartDate}</strong> at an average rate of <strong className="text-[#0D8A5E]">${optimizer.averageNightlyRate} / night</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn(optimizer.bestStartDate);
                    setCheckOut(optimizer.bestEndDate);
                  }}
                  className="px-4 py-2 bg-[#F8F6F0] hover:bg-[#EFECE4] border border-[#E4DFD5] text-xs font-semibold rounded-xl text-[#14251F] transition-colors"
                >
                  Apply Optimal Dates ({optimizer.bestStartDate} → {optimizer.bestEndDate})
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right Sticky Booking Box */}
        <div className="lg:col-span-4 sticky top-28 bg-white rounded-3xl border border-[#E4DFD5] shadow-luxury-lg p-6 sm:p-8 space-y-6">
          <div className="flex items-baseline justify-between border-b border-[#EFECE4] pb-4">
            <div>
              <span className="text-xs text-[#5A626A] line-through">
                Retail ${Number(deal.originalPrice).toFixed(2)}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-editorial text-[#14251F]">
                  ${Number(deal.mysteryPrice).toFixed(2)}
                </span>
                <span className="text-xs text-[#5A626A]">/ night</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0D8A5E] bg-emerald-50 px-2.5 py-1 rounded-full">
              Save ${Number(deal.originalPrice - deal.mysteryPrice).toFixed(2)} / night
            </span>
          </div>

          {/* Date & Occupancy Selector */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5]">
                <label className="block text-[10px] font-bold uppercase text-[#5A626A] mb-1">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent font-semibold text-[#14251F] focus:outline-none w-full text-xs"
                />
              </div>
              <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5]">
                <label className="block text-[10px] font-bold uppercase text-[#5A626A] mb-1">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent font-semibold text-[#14251F] focus:outline-none w-full text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5] flex justify-between items-center">
              <div>
                <span className="block text-[10px] font-bold uppercase text-[#5A626A]">
                  Guests & Rooms
                </span>
                <span className="font-semibold text-[#14251F]">
                  {adults} Adults • {rooms} Suite
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  className="w-6 h-6 rounded bg-white border border-[#E4DFD5] flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold">{rooms}</span>
                <button
                  type="button"
                  onClick={() => setRooms(rooms + 1)}
                  className="w-6 h-6 rounded bg-white border border-[#E4DFD5] flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs border-t border-[#EFECE4] pt-4">
            <div className="flex justify-between text-[#5A626A]">
              <span>${deal.mysteryPrice} × {nights} nights × {rooms} suite</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#5A626A]">
              <span>Taxes & 5-Star Resort Fees</span>
              <span className="text-[#0D8A5E] font-semibold">Included</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#14251F] border-t border-[#EFECE4] pt-3">
              <span>Total Guaranteed Due</span>
              <span className="font-editorial text-2xl">${subtotal.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-[#0D8A5E] font-semibold text-right">
              Total Discount Savings: ${totalSavings.toFixed(2)} ({deal.discountPercent}% OFF)
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={handleProceedToBooking}
            className="w-full py-4 bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-luxury-gold flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Wholesale Rate & Continue</span>
          </button>

          <p className="text-[10px] text-[#5A626A] text-center leading-relaxed">
            By reserving, your room is held under a 15-minute lock. Hotel identity revealed upon payment completion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
