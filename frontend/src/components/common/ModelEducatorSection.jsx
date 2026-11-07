import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Sparkles, 
  ShieldCheck, 
  EyeOff, 
  Eye, 
  TrendingDown, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock, 
  Compass, 
  Check, 
  HelpCircle,
  Percent,
  BedDouble,
  DollarSign
} from 'lucide-react';
import Modal from './Modal';

export const ModelEducatorSection = () => {
  const [activeTab, setActiveTab] = useState('travelers'); // 'travelers' | 'hoteliers'
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [activeModalStep, setActiveModalStep] = useState(1);

  const STEPS = [
    {
      step: 1,
      title: 'Hotels List Unsold Inventory',
      badge: 'Perishable Asset Yield',
      icon: BedDouble,
      description: 'Luxury 5-star hotels list unsold suites at exclusive 20%–70% wholesale discounts instead of letting rooms sit empty tonight.',
      detail: 'An unsold room at midnight produces $0 in revenue. By privately discounting distressed rooms, hotels recover thousands in high-margin yield.'
    },
    {
      step: 2,
      title: 'Masked Identity Exploration',
      badge: 'Zero Rate-Parity Conflict',
      icon: EyeOff,
      description: 'Customers discover curated stays without seeing the hotel’s exact name, protecting hotel brand prestige and public rate agreements.',
      detail: 'Publicly cutting prices on OTAs violates rate-parity agreements. MysteryStay masks the brand identity so hotels can discount without penalty.'
    },
    {
      step: 3,
      title: 'Review All Essential Clues',
      badge: 'Full Decision Transparency',
      icon: Compass,
      description: 'Travelers inspect neighborhood, verified star rating, guest reviews, room category, and exact amenities before committing.',
      detail: 'You see verified 5-star badges, specific zones (e.g. Bandra West, Indiranagar), included amenities (plunge pool, butler), and cancellation policies.'
    },
    {
      step: 4,
      title: '15-Minute Guaranteed Hold',
      badge: 'Pessimistic DB Lock',
      icon: Clock,
      description: 'Lock in the wholesale rate. Our database acquires a pessimistic row lock for 15 minutes, guaranteeing zero double-bookings.',
      detail: 'The inventory ledger reserves your specific room. No other traveler can buy it while you complete secure sandbox payment.'
    },
    {
      step: 5,
      title: 'Immediate Hotel Reveal',
      badge: 'Confirmed Unmasked Stay',
      icon: Unlock,
      description: 'Upon confirmed payment, the veil lifts instantly: receive your official voucher with the prestigious hotel name, address, and concierge desk.',
      detail: 'You get an official voucher with the unmasked property name (e.g., The Leela Palace), exact street coordinates, and direct VIP check-in access.'
    }
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      {/* 1. Header & Compelling Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14251F] text-[#C6A66B] text-xs font-semibold border border-[#C6A66B]/30 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Not Just Another Hotel Booking Platform</span>
        </div>

        <h2 className="font-editorial text-4xl sm:text-6xl text-[#14251F] leading-tight">
          "The Hotel Is a Mystery.<br />
          <span className="italic font-light text-[#8C6D32]">The Deal Is Real."</span>
        </h2>

        <p className="text-sm sm:text-base text-[#5A626A] font-light leading-relaxed max-w-2xl mx-auto">
          Unlike standard booking sites that simply display public retail rates, MysteryStay is an intelligent private marketplace. We help world-class 5-star hotels quietly monetize unsold rooms without public rate-parity violations.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowWalkthroughModal(true)}
            className="px-6 py-3 rounded-xl bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider transition-all shadow-luxury-gold inline-flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" /> Discover How It Works <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual 5-Step Journey Cards */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            The 5-Stage MysteryStay Protocol
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl text-[#14251F] mt-1">
            How Mystery Hotel Deals Work
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="group bg-white rounded-3xl p-6 border border-[#E4DFD5] shadow-luxury hover:border-[#C6A66B] transition-all flex flex-col justify-between space-y-4 luxury-card-hover relative overflow-hidden"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-editorial text-base font-bold group-hover:scale-105 transition-transform">
                    {s.step}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D32] bg-[#F4EEDA] px-2 py-0.5 rounded-full">
                    Stage {s.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[#14251F]">
                    <Icon className="w-4 h-4 text-[#C6A66B] shrink-0" />
                    <h4 className="font-editorial text-lg text-[#14251F] leading-snug">
                      {s.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5A626A] leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFECE4] text-[10px] font-semibold text-[#0D8A5E]">
                  {s.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Traditional OTA vs. MysteryStay Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-[#E4DFD5] shadow-luxury-lg overflow-hidden">
        <div className="p-8 sm:p-10 border-b border-[#EFECE4] text-center space-y-2 bg-[#F8F6F0]/60">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Side-by-Side Comparison
          </span>
          <h3 className="font-editorial text-3xl text-[#14251F]">
            Traditional Hotel Booking vs. MysteryStay
          </h3>
          <p className="text-xs text-[#5A626A] max-w-xl mx-auto">
            See why the identity-masked model unlocks discounts impossible on public travel agencies.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#14251F] text-white">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-1/3">
                  Booking Dimension
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-rose-300 w-1/3">
                  Traditional Booking Sites (Expedia, OTAs)
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#DFCA9E] w-1/3">
                  MysteryStay Privé Model
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE4] text-[#1C1F24]">
              <tr className="hover:bg-[#F8F6F0]/50 transition-colors">
                <td className="py-4 px-6 font-semibold">Hotel Name Visibility</td>
                <td className="py-4 px-6 text-[#5A626A]">
                  <span className="inline-flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" /> Public upfront on public search
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-[#14251F]">
                  <span className="inline-flex items-center gap-1.5 text-[#0D8A5E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Masked by clues; revealed upon payment
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8F6F0]/50 transition-colors">
                <td className="py-4 px-6 font-semibold">Pricing & Discounts</td>
                <td className="py-4 px-6 text-[#5A626A]">
                  <span className="inline-flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" /> Full retail price (0%–10% typical promo)
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-[#14251F]">
                  <span className="inline-flex items-center gap-1.5 text-[#0D8A5E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> 20% to 70% deep wholesale discounts
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8F6F0]/50 transition-colors">
                <td className="py-4 px-6 font-semibold">Inventory Nature</td>
                <td className="py-4 px-6 text-[#5A626A]">
                  Standard public inventory
                </td>
                <td className="py-4 px-6 font-bold text-[#14251F]">
                  <span className="inline-flex items-center gap-1.5 text-[#0D8A5E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Perishable unsold suites that expire tonight
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8F6F0]/50 transition-colors">
                <td className="py-4 px-6 font-semibold">Hotel Rate-Parity Impact</td>
                <td className="py-4 px-6 text-[#5A626A]">
                  <span className="inline-flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" /> Violates OTA contracts if discounted publicly
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-[#14251F]">
                  <span className="inline-flex items-center gap-1.5 text-[#0D8A5E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> 100% compliant with zero brand damage
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#F8F6F0]/50 transition-colors">
                <td className="py-4 px-6 font-semibold">Double-Booking Guard</td>
                <td className="py-4 px-6 text-[#5A626A]">
                  Asynchronous batch processing
                </td>
                <td className="py-4 px-6 font-bold text-[#14251F]">
                  <span className="inline-flex items-center gap-1.5 text-[#0D8A5E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Pessimistic row write lock (15-min hold)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Mutual Value Proposition: Travelers vs Hoteliers */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Mutual Win-Win Dynamics
            </span>
            <h3 className="font-editorial text-3xl text-[#14251F]">
              Why Both Sides Win on MysteryStay
            </h3>
          </div>

          <div className="flex items-center bg-[#F8F6F0] p-1 rounded-2xl border border-[#E4DFD5]">
            <button
              onClick={() => setActiveTab('travelers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'travelers'
                  ? 'bg-[#14251F] text-white shadow-md'
                  : 'text-[#5A626A] hover:text-[#14251F]'
              }`}
            >
              For Travelers
            </button>
            <button
              onClick={() => setActiveTab('hoteliers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hoteliers'
                  ? 'bg-[#14251F] text-white shadow-md'
                  : 'text-[#5A626A] hover:text-[#14251F]'
              }`}
            >
              For Hotel Partners
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'travelers' ? (
            <motion.div
              key="travelers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4DFD5] shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D8A5E] flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-[#14251F]">
                  5-Star Suites for 3-Star Rates
                </h4>
                <p className="text-xs text-[#5A626A] leading-relaxed">
                  Enjoy opulent presidential suites, cliffside beachfront villas, and heritage palace retreats at 20%–70% below published retail rates.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4DFD5] shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8C6D32] flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-[#14251F]">
                  Transparent Clues & Inclusions
                </h4>
                <p className="text-xs text-[#5A626A] leading-relaxed">
                  Know exactly what matters: the city zone, star tier, guest review benchmarks, private pool or butler access, and room specifications.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4DFD5] shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-[#14251F]">
                  Pessimistic Hold & Safe Reveal
                </h4>
                <p className="text-xs text-[#5A626A] leading-relaxed">
                  Once held, your room is 100% reserved for 15 minutes. Upon confirmation, the hotel coordinates are instantly revealed in your trips ledger.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hoteliers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-[#14251F] text-white rounded-3xl p-6 sm:p-8 border border-[#C6A66B]/30 shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C6A66B] flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-white">
                  Monetize Perishable Loss
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  An unsold room produces zero revenue at midnight. MysteryStay turns empty suites into high-margin incremental cash flow.
                </p>
              </div>

              <div className="bg-[#14251F] text-white rounded-3xl p-6 sm:p-8 border border-[#C6A66B]/30 shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C6A66B] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-white">
                  Preserve Brand Prestige
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Publicly cutting prices signals distress and damages brand perception. Identity masking protects your brand reputation completely.
                </p>
              </div>

              <div className="bg-[#14251F] text-white rounded-3xl p-6 sm:p-8 border border-[#C6A66B]/30 shadow-luxury space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C6A66B] flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-editorial text-xl text-white">
                  Rate Parity Compliant
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Because prices are opaque and identity is masked, MysteryStay listings do not breach existing global OTA distribution contracts.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. INTERACTIVE HOW IT WORKS WALKTHROUGH MODAL */}
      <Modal
        isOpen={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
        title="The MysteryStay Model: Step-by-Step"
        subtitle="Learn how we unlock five-star luxury without rate-parity violations"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 text-xs">
          {/* Step Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveModalStep(s.step)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  activeModalStep === s.step
                    ? 'bg-[#14251F] text-white shadow-md'
                    : 'bg-[#F8F6F0] text-[#5A626A] hover:bg-[#EFECE4]'
                }`}
              >
                Step {s.step}: {s.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active Step Details */}
          {(() => {
            const current = STEPS.find((s) => s.step === activeModalStep) || STEPS[0];
            const Icon = current.icon;
            return (
              <div className="bg-[#F8F6F0] rounded-2xl p-6 border border-[#E4DFD5] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#14251F]">
                    <div className="w-8 h-8 rounded-lg bg-[#C6A66B] text-[#14251F] flex items-center justify-center font-editorial font-bold">
                      {current.step}
                    </div>
                    <span>{current.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0D8A5E] bg-emerald-50 px-2.5 py-1 rounded-full">
                    {current.badge}
                  </span>
                </div>

                <p className="text-xs text-[#1C1F24] leading-relaxed">
                  {current.detail}
                </p>
              </div>
            );
          })()}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveModalStep((prev) => Math.max(1, prev - 1))}
              disabled={activeModalStep === 1}
              className="px-4 py-2 rounded-xl border border-[#E4DFD5] text-[#5A626A] disabled:opacity-40"
            >
              Previous Step
            </button>

            {activeModalStep < 5 ? (
              <button
                onClick={() => setActiveModalStep((prev) => Math.min(5, prev + 1))}
                className="px-5 py-2 rounded-xl bg-[#14251F] text-white font-bold inline-flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowWalkthroughModal(false)}
                className="px-5 py-2 rounded-xl bg-[#C6A66B] text-[#14251F] font-bold uppercase tracking-wider"
              >
                Got It! Explore Deals
              </button>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default ModelEducatorSection;
