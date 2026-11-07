import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0C1814] text-[#F8F6F0] pt-20 pb-12 border-t border-[#14251F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Newsletter & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-editorial text-xl font-bold border border-[#C6A66B]/30">
                M
              </div>
              <span className="font-editorial text-2xl tracking-tight text-white">
                MysteryStay
              </span>
            </div>
            <p className="text-xs font-medium text-[#DFCA9E] italic">
              "Discover Hidden Stays. Unlock Better Deals."
            </p>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Monetizing perishable 5-star hotel inventory without brand dilution. Guaranteed luxury accommodations unlocked with strict rate parity protection.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#C6A66B]">
                <Lock className="w-3.5 h-3.5" /> Identity Revealed Post-Booking
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Rate Parity Safe
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-[#14251F]/60 border border-[#C6A66B]/20 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#C6A66B] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                The Privé Gazette
              </div>
              <h3 className="font-editorial text-2xl text-white mb-2 font-normal">
                Curated Secret Deals Delivered Bi-Weekly
              </h3>
              <p className="text-xs text-white/60 mb-6 max-w-md">
                Subscribers receive first access to 40%–70% mystery suites in Bangalore, Mumbai, Goa, and Delhi before public release.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your private email"
                  className="bg-[#0C1814] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C6A66B] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors shrink-0 flex items-center justify-center gap-2"
                >
                  Join Gazette <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Directory Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs">
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/search?city=Bangalore" className="hover:text-[#C6A66B]">Bangalore Heritage & Tech</Link></li>
              <li><Link to="/search?city=Mumbai" className="hover:text-[#C6A66B]">Mumbai Waterfront Suites</Link></li>
              <li><Link to="/search?city=Goa" className="hover:text-[#C6A66B]">Goa Secluded Beach Villas</Link></li>
              <li><Link to="/search?city=Delhi" className="hover:text-[#C6A66B]">Delhi Art Deco Mansions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/dsa-lab" className="hover:text-[#C6A66B]">DSA Algorithm Laboratory</Link></li>
              <li><Link to="/dsa-lab" className="hover:text-[#C6A66B]">Sliding Window Price Optimizer</Link></li>
              <li><Link to="/dsa-lab" className="hover:text-[#C6A66B]">Top-K Min-Heap Ranker</Link></li>
              <li><Link to="/dsa-lab" className="hover:text-[#C6A66B]">Inverted Index Sub-ms Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">
              Hoteliers
            </h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/partner" className="hover:text-[#C6A66B]">Partner Studio Portal</Link></li>
              <li><Link to="/partner" className="hover:text-[#C6A66B]">Perishable Inventory Ledger</Link></li>
              <li><Link to="/partner" className="hover:text-[#C6A66B]">Zero Brand Damage Guarantee</Link></li>
              <li><Link to="/partner" className="hover:text-[#C6A66B]">Rate Parity Agreement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">
              Founder & System
            </h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/about" className="hover:text-[#C6A66B] font-medium text-white/90">About Founder: Prakash Chakali</Link></li>
              <li><Link to="/admin" className="hover:text-[#C6A66B]">Platform Admin Console</Link></li>
              <li><span className="text-white/40">Spring Boot 3.3.5 Modular Monolith</span></li>
              <li><span className="text-white/40">MySQL 9.x Flyway Migrations (v7)</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Creator Credit */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            © 2026 <strong className="text-white">MysteryStay</strong> • Founder & Developer: <strong className="text-[#C6A66B]">Prakash Chakali</strong> • <span className="italic text-white/70">Discover Hidden Stays. Unlock Better Deals.</span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white cursor-pointer text-[#C6A66B]">Founder Profile</Link>
            <span className="hover:text-white cursor-pointer">Java 21 Monolith</span>
            <span className="hover:text-white cursor-pointer">React 18</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
