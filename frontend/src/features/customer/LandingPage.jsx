import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle2, 
  Building, 
  DollarSign, 
  Star,
  Compass,
  Award,
  Zap,
  Sliders
} from 'lucide-react';
import SearchPanel from '../../components/forms/SearchPanel';
import MysteryDealCard from '../../components/cards/MysteryDealCard';
import Modal from '../../components/common/Modal';
import { dealService } from '../../services/dealService';
import { dsaService } from '../../services/dsaService';

export const LandingPage = () => {
  const [deals, setDeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [optimizedModalDeal, setOptimizedModalDeal] = useState(null);
  const [optimizerData, setOptimizerData] = useState(null);

  useEffect(() => {
    dealService.getPublicDeals().then(setDeals);
  }, []);

  const handleOpenOptimizer = async (deal) => {
    setOptimizedModalDeal(deal);
    const data = await dsaService.getBestStayWindow(deal.dealId, 3);
    setOptimizerData(data);
  };

  const CATEGORIES = [
    { id: 'ALL', label: 'All Curated Stays', icon: Sparkles },
    { id: 'BEACH', label: 'Beachfront & Coastal', icon: Compass },
    { id: 'HERITAGE', label: 'Heritage Palaces', icon: Building },
    { id: 'EXECUTIVE', label: 'Executive City Suites', icon: Award },
    { id: 'SUPER_DEAL', label: 'Super Deals (≥45% OFF)', icon: TrendingDown },
  ];

  const filteredDeals = deals.filter(deal => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'BEACH') return deal.city.toLowerCase() === 'goa';
    if (selectedCategory === 'HERITAGE') return deal.city.toLowerCase() === 'bangalore' || deal.city.toLowerCase() === 'delhi';
    if (selectedCategory === 'EXECUTIVE') return deal.city.toLowerCase() === 'mumbai';
    if (selectedCategory === 'SUPER_DEAL') return deal.discountPercent >= 45;
    return true;
  });

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-8">
        {/* Editorial Background Image with Luxury Tint */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury Resort Architecture"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.78]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F0] via-black/30 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 mt-12">
          {/* Trust Pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14251F]/80 backdrop-blur-md border border-[#C6A66B]/50 text-white text-xs font-medium shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span className="text-[#C6A66B] font-bold">Unsold Inventory Unmasked</span>
            <span className="text-white/40">•</span>
            <span>20% to 70% Off 5-Star Suites</span>
          </motion.div>

          {/* Large Editorial Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[1.05]">
              Luxury stays.<br />
              <span className="italic font-light text-[#DFCA9E]">Unexpected prices.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 font-light leading-relaxed">
              Top luxury resorts and executive hotels protect their published room rates by masking their identity until reservation confirmation. You enjoy five-star elegance at wholesale pricing.
            </p>
          </motion.div>

          {/* Floating Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pt-4"
          >
            <SearchPanel />
          </motion.div>

          {/* Key Metric Seals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-4 text-xs font-medium text-white/70"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A66B]" />
              <span>Strict 5-Star Partner Vetting</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C6A66B]" />
              <span>100% Rate Parity Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C6A66B]" />
              <span>Sub-ms Inverted Index Search</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORY BAR & CURATED DEALS DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#E4DFD5]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B] block mb-1">
              Curated Privé Collection
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#14251F] font-normal">
              Featured Mystery Stays
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#14251F] text-[#F8F6F0] shadow-luxury'
                      : 'bg-white border border-[#E4DFD5] text-[#5A626A] hover:bg-[#EFECE4]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C6A66B]' : ''}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => (
            <MysteryDealCard
              key={deal.dealId}
              deal={deal}
              onOptimizeClick={handleOpenOptimizer}
            />
          ))}
        </div>
      </section>

      {/* 3. HOW MYSTERYSTAY WORKS */}
      <section className="bg-white border-y border-[#E4DFD5] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              The Secret Protocol
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl text-[#14251F] font-normal">
              How MysteryStay Works
            </h2>
            <p className="text-sm text-[#5A626A]">
              Three simple steps to unlock the finest suites at unprecedented price points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#F8F6F0] rounded-3xl p-8 border border-[#E4DFD5] space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-editorial text-2xl font-bold">
                1
              </div>
              <h3 className="font-editorial text-2xl text-[#14251F]">
                Discover by Clues
              </h3>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Filter by verified 5-star tiers, city neighborhood, guest reviews, and bespoke luxury amenities (e.g. private plunge pool, heritage courtyard).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8F6F0] rounded-3xl p-8 border border-[#E4DFD5] space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-editorial text-2xl font-bold">
                2
              </div>
              <h3 className="font-editorial text-2xl text-[#14251F]">
                Lock Wholesale Rate
              </h3>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Reserve your dates with pessimistic write locking, holding inventory exclusively for 15 minutes while you complete checkout.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8F6F0] rounded-3xl p-8 border border-[#E4DFD5] space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#C6A66B] text-[#14251F] flex items-center justify-center font-editorial text-2xl font-bold">
                3
              </div>
              <h3 className="font-editorial text-2xl text-[#14251F]">
                Unmask Exact Identity
              </h3>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Upon verified payment confirmation, receive your official reservation voucher revealing the prestigious hotel name, address, and concierge phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY HOTELS OFFER MYSTERY DEALS (BUSINESS PARADIGM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#14251F] text-[#F8F6F0] rounded-3xl p-8 sm:p-16 border border-[#C6A66B]/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Perishable Inventory Economics
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-normal leading-tight">
              Why Prestigious 5-Star Hotels Choose MysteryStay
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-xl">
              An unsold luxury hotel room tonight loses 100% of its potential revenue at midnight. However, publicly slashing prices damages brand prestige and triggers rate-parity penalties across global OTAs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6A66B] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">Zero public rate-parity conflicts with Expedia or Booking.com</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6A66B] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">Full luxury brand prestige and rate integrity preserved</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6A66B] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">38% average incremental lift in perishable room occupancy</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6A66B] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">Automated 15-minute transactional hold expiration</span>
              </div>
            </div>
            <div className="pt-4">
              <Link
                to="/partner"
                className="px-6 py-3.5 rounded-xl bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-luxury-gold"
              >
                Hoteliers: Onboard Property <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0C1814] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h3 className="font-editorial text-xl text-white">
              The Occupancy Yield Math
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Published Suite Rate</span>
                <span className="font-semibold text-white">$500.00 / night</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Unsold Perishable Night</span>
                <span className="font-semibold text-rose-400">$0.00 (Lost Asset)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">MysteryStay Confidential Deal</span>
                <span className="font-semibold text-[#DFCA9E]">$275.00 (45% OFF)</span>
              </div>
              <div className="flex justify-between pt-2 text-[#0D8A5E] font-bold">
                <span>Recovered Hoteliers Profit</span>
                <span>+$275.00 / night</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Top Sanctuaries
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#14251F]">
              Explore by Luxury Destination
            </h2>
          </div>
          <Link to="/search" className="text-xs font-semibold text-[#8C6D32] hover:text-[#14251F] inline-flex items-center gap-1">
            View All Stays <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { city: 'Bangalore', subtitle: 'Royal Palaces & Tech Capitals', deals: 4, img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop' },
            { city: 'Mumbai', subtitle: 'Arabian Sea Panoramic Suites', deals: 6, img: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop' },
            { city: 'Goa', subtitle: 'Secluded Beach & Cliff Villas', deals: 8, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
            { city: 'Delhi', subtitle: 'Colonial Courtyards & Mansions', deals: 5, img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop' }
          ].map((dest) => (
            <Link
              key={dest.city}
              to={`/search?city=${dest.city}`}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden luxury-card-hover bg-[#14251F]"
            >
              <img
                src={dest.img}
                alt={dest.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66B]">
                  {dest.deals} Active Deals
                </span>
                <h3 className="font-editorial text-2xl">{dest.city}</h3>
                <p className="text-xs text-white/70">{dest.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. SAVINGS COMPARISON SECTION */}
      <section className="bg-white border-y border-[#E4DFD5] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Real Savings Math
            </span>
            <h2 className="font-editorial text-4xl text-[#14251F]">
              Public OTA Retail vs. MysteryStay Confidential
            </h2>
            <p className="text-xs text-[#5A626A] max-w-lg mx-auto">
              Direct rate comparison for the exact same 5-star hotel room category and dates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Public Online Travel Agent */}
            <div className="bg-[#F8F6F0] rounded-3xl p-8 border border-[#E4DFD5] space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A]">
                  Typical Public OTA
                </span>
                <span className="text-xs text-rose-600 font-semibold">Standard Retail</span>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold font-editorial text-[#14251F]">$450.00</div>
                <div className="text-xs text-[#5A626A]">Per night + mandatory resort fees</div>
              </div>
              <ul className="space-y-3 text-xs text-[#5A626A] border-t border-[#EFECE4] pt-4">
                <li>• Public hotel identity visible upfront</li>
                <li>• High marketing overhead built into price</li>
                <li>• Rigid cancellation policies</li>
              </ul>
            </div>

            {/* MysteryStay Confidential */}
            <div className="bg-[#14251F] text-white rounded-3xl p-8 border border-[#C6A66B]/50 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#C6A66B] text-[#14251F] px-4 py-1 text-[11px] font-bold rounded-bl-2xl uppercase tracking-wider">
                50% Saved
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C6A66B]">
                  MysteryStay Privé
                </span>
                <span className="text-xs text-[#0D8A5E] font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                  Guaranteed 5-Star
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold font-editorial text-white">$225.00</div>
                <div className="text-xs text-[#DFCA9E]">Identical suite, unmasked upon confirmation</div>
              </div>
              <ul className="space-y-3 text-xs text-white/80 border-t border-white/10 pt-4">
                <li>• Identity revealed immediately upon payment</li>
                <li>• Direct hotel reservation with all amenities included</li>
                <li>• 15-minute pessimistic hold lock</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GUEST TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Confidential Discoveries
          </span>
          <h2 className="font-editorial text-4xl text-[#14251F]">
            Traveler Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Booked a 'Confidential 5-Star Oceanfront Suite' in North Goa for $260. Upon payment, the reveal confirmed it was a premier cliffside villa retailing at $520. Exceptional stay.",
              author: "Ananya Sharma",
              role: "Private Equity Partner",
              stay: "Goa Beachfront Villa"
            },
            {
              quote: "The Indiranagar Heritage Palace mystery deal saved our firm over $1,200 across a 4-night executive retreat. The butler service and lagoon pool were world-class.",
              author: "Rohan Varma",
              role: "Tech Executive",
              stay: "Bangalore Heritage Suite"
            },
            {
              quote: "I was skeptical about identity masking at first, but MysteryStay’s guarantee is rock solid. The Bandra sea view suite was breathtaking and completely seamless.",
              author: "Claire Dupont",
              role: "Architectural Designer",
              stay: "Mumbai Ocean Suite"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-[#E4DFD5] shadow-luxury flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#C6A66B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#1C1F24] leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>
              <div className="border-t border-[#EFECE4] pt-4">
                <div className="font-editorial text-base text-[#14251F]">{item.author}</div>
                <div className="text-[11px] text-[#5A626A]">{item.role} • <span className="text-[#8C6D32]">{item.stay}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: SLIDING WINDOW PRICE OPTIMIZER (DSA LAB TRIGGER) */}
      <Modal
        isOpen={!!optimizedModalDeal}
        onClose={() => setOptimizedModalDeal(null)}
        title="Sliding Window Stay Optimizer"
        subtitle={`Finding the consecutive 3-night cheapest window for ${optimizedModalDeal?.mysteryTitle}`}
        maxWidth="max-w-2xl"
      >
        {optimizerData && (
          <div className="space-y-6 text-xs">
            <div className="bg-[#14251F] text-white p-6 rounded-2xl border border-[#C6A66B]/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#C6A66B] font-bold uppercase tracking-wider block">
                  Optimal Stay Window Detected (O(D) Time)
                </span>
                <span className="font-editorial text-2xl text-white">
                  {optimizerData.bestStartDate} → {optimizerData.bestEndDate}
                </span>
                <span className="text-white/60 block mt-1">
                  Avg. ${optimizerData.averageNightlyRate} / night (Total: ${optimizerData.totalOptimizedCost})
                </span>
              </div>
              <Link
                to={`/deals/${optimizedModalDeal?.dealId}`}
                className="px-4 py-2 rounded-xl bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase"
              >
                Lock Deal
              </Link>
            </div>

            {/* 14-Day Calendar Price Strip */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#14251F]">
                14-Day Rate Calendar (Sliding Window in Emerald):
              </span>
              <div className="grid grid-cols-7 gap-2">
                {optimizerData.calendarPrices.map((day) => (
                  <div
                    key={day.dayIndex}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      day.inOptimalWindow
                        ? 'bg-[#0D8A5E] text-white border-transparent font-bold shadow-md scale-105'
                        : 'bg-[#F8F6F0] text-[#14251F] border-[#E4DFD5]'
                    }`}
                  >
                    <div className="text-[9px] opacity-70">Day {day.dayIndex}</div>
                    <div className="text-xs font-semibold">${day.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
