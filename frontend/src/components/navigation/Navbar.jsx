import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Cpu, 
  Briefcase, 
  Building2, 
  ShieldAlert, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export const Navbar = () => {
  const { role, activeRolePreset, switchRolePreset, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E4DFD5]">
      {/* Top Banner: Persona Switcher & Creator Credit */}
      <div className="bg-[#14251F] text-[#F8F6F0] py-1.5 px-4 sm:px-8 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D8A5E] animate-pulse" />
            <span className="text-[#C6A66B] font-semibold">Live Monolith</span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Founder & Developer: <strong className="text-[#DFCA9E]">Prakash Chakali</strong></span>
            <span className="text-white/40 hidden md:inline">•</span>
            <span className="hidden md:inline text-white/70">"Discover Hidden Stays. Unlock Better Deals."</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0C1814] px-2 py-0.5 rounded-full border border-white/10">
            <span className="text-white/50 text-[11px] mr-1 hidden md:inline">Persona:</span>
            <button
              onClick={() => switchRolePreset('CUSTOMER')}
              className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                activeRolePreset === 'CUSTOMER'
                  ? 'bg-[#C6A66B] text-[#14251F] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Traveler
            </button>
            <button
              onClick={() => switchRolePreset('HOTEL_MANAGER')}
              className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                activeRolePreset === 'HOTEL_MANAGER'
                  ? 'bg-[#C6A66B] text-[#14251F] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Hotel Partner
            </button>
            <button
              onClick={() => switchRolePreset('ADMIN')}
              className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                activeRolePreset === 'ADMIN'
                  ? 'bg-[#C6A66B] text-[#14251F] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Platform Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-editorial text-2xl font-bold shadow-luxury group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <span className="font-editorial text-2xl tracking-tight text-[#14251F] block leading-none">
              MysteryStay
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#C6A66B] block mt-0.5">
              Discover Hidden Stays. Unlock Better Deals.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/search"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/search')
                ? 'bg-[#14251F] text-[#F8F6F0]'
                : 'text-[#14251F] hover:bg-[#EFECE4]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#C6A66B]" />
            Discover Stays
          </Link>

          <Link
            to="/dsa-lab"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/dsa-lab')
                ? 'bg-[#14251F] text-[#F8F6F0]'
                : 'text-[#14251F] hover:bg-[#EFECE4]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#C6A66B]" />
            DSA Laboratory
          </Link>

          <Link
            to="/about"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/about')
                ? 'bg-[#14251F] text-[#F8F6F0]'
                : 'text-[#14251F] hover:bg-[#EFECE4]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C6A66B]" />
            About Founder
          </Link>

          <Link
            to="/trips"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/trips')
                ? 'bg-[#14251F] text-[#F8F6F0]'
                : 'text-[#14251F] hover:bg-[#EFECE4]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#C6A66B]" />
            My Trips
          </Link>

          {(role === 'ROLE_HOTEL_MANAGER' || role === 'ROLE_ADMIN') && (
            <Link
              to="/partner"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/partner')
                  ? 'bg-[#14251F] text-[#F8F6F0]'
                  : 'text-[#14251F] hover:bg-[#EFECE4]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#C6A66B]" />
              Partner Studio
            </Link>
          )}

          {role === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-[#14251F] text-[#F8F6F0]'
                  : 'text-[#14251F] hover:bg-[#EFECE4]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-[#C6A66B]" />
              Admin Console
            </Link>
          )}
        </nav>

        {/* User Badge & Quick CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#14251F] block">
              Prakash Chakali
            </span>
            <span className="text-[10px] text-[#C6A66B] font-semibold block">
              {role === 'ROLE_ADMIN'
                ? 'Platform Owner (Admin)'
                : role === 'ROLE_HOTEL_MANAGER'
                ? 'Hotel Partner Lead'
                : 'Verified Traveler'}
            </span>
          </div>
          <Link
            to="/search"
            className="px-4 py-2 rounded-xl bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] text-xs font-bold tracking-wide uppercase shadow-luxury-gold transition-all"
          >
            Explore Deals
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl hover:bg-[#EFECE4] text-[#14251F]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F8F6F0] border-b border-[#E4DFD5] px-6 py-4 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            Discover Stays
          </Link>
          <Link
            to="/dsa-lab"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            DSA Laboratory
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            About Founder
          </Link>
          <Link
            to="/trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            My Trips
          </Link>
          <Link
            to="/partner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            Partner Studio
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#14251F] hover:bg-[#EFECE4]"
          >
            Admin Console
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
