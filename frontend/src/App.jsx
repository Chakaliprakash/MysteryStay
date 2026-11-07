import React, { useState, useEffect, useRef } from 'react';
import {
  checkSystemHealth,
  registerUser,
  loginUser,
  fetchCurrentUser,
  logoutUser,
  fetchAmenities,
  createHotel,
  fetchMyHotels,
  fetchAdminHotels,
  createRoomType,
  fetchRoomTypesByHotel,
  fetchPublicDeals,
  createMysteryDeal,
  searchMysteryDeals,
  fetchBestStayWindow,
  createBooking,
  fetchMyBookings,
  confirmBooking,
  cancelBooking
} from './api/client';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Unlock,
  Clock,
  Calendar,
  MapPin,
  Star,
  Tag,
  Percent,
  EyeOff,
  Zap,
  TrendingDown,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Compass,
  CreditCard,
  ArrowRight,
  Search,
  Check,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';

export default function App() {
  // Navigation & Category state
  const [activeSection, setActiveSection] = useState('explore'); // 'explore' | 'deals' | 'dsa' | 'trips' | 'partner' | 'auth'
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({
    email: 'customer@mysterystay.com',
    password: 'Password123!',
    fullName: 'Alex Morgan',
    role: 'ROLE_CUSTOMER'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  // Deals state
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  // DSA Search state
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    minRating: '',
    maxPrice: '',
    k: 5,
    sortBy: 'VALUE_SCORE',
    amenities: []
  });
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeStayWindow, setActiveStayWindow] = useState(null);
  const [stayWindowLoading, setStayWindowLoading] = useState(false);

  // Bookings state (Phase 7)
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedDealForBooking, setSelectedDealForBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    roomCount: 1,
    adultCount: 2,
    guestName: 'Alex Morgan',
    guestEmail: 'customer@mysterystay.com',
    guestPhone: '+919876543210',
    specialRequests: 'High-floor quiet room with city skyline views'
  });
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins

  // Partner portal state
  const [myHotels, setMyHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [hotelForm, setHotelForm] = useState({
    name: 'The Grand Azure Palace',
    brandChain: 'Azure Collection',
    starRating: 5,
    address: '42 MG Road, Central Residency',
    city: 'Bangalore',
    zoneArea: 'Indiranagar',
    postalCode: '560038',
    phone: '+918023456789',
    email: 'reservations@grandazure.com',
    selectedAmenities: [1, 2, 3, 6]
  });
  const [dealPublishForm, setDealPublishForm] = useState({
    roomTypeId: '',
    mysteryTitle: '5-Star Waterfront Splendor in Bandra',
    descriptionClues: 'Panoramic oceanfront vistas with private infinity dip pools and Michelin-starred dining.',
    discountPercent: 40,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [managerMessage, setManagerMessage] = useState(null);

  const bookingDialogRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Initialize
  useEffect(() => {
    loadDeals();
    checkCurrentUser();

    // Close search dropdown on click outside
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 15-minute countdown timer effect
  useEffect(() => {
    let timer = null;
    if (activeBooking && activeBooking.status === 'PENDING_PAYMENT') {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeBooking]);

  const checkCurrentUser = async () => {
    try {
      const res = await fetchCurrentUser();
      setCurrentUser(res.data);
      if (res.data) {
        setAuthForm((prev) => ({
          ...prev,
          email: res.data.email,
          fullName: res.data.fullName
        }));
        setBookingFormData((prev) => ({
          ...prev,
          guestName: res.data.fullName || 'Alex Morgan',
          guestEmail: res.data.email
        }));
      }
    } catch {
      // User not logged in
    }
  };

  const loadDeals = async () => {
    setDealsLoading(true);
    try {
      const res = await fetchPublicDeals();
      setDeals(res.data || []);
    } catch {
      // Ignored
    } finally {
      setDealsLoading(false);
    }
  };

  const loadUserBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetchMyBookings();
      setMyBookings(res.data || []);
    } catch {
      // Ignored
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadPartnerData = async () => {
    try {
      const hotelsRes = await fetchMyHotels().catch(() => ({ data: [] }));
      setMyHotels(hotelsRes.data || []);
      if (hotelsRes.data && hotelsRes.data.length > 0) {
        setSelectedHotelId(hotelsRes.data[0].id);
        const rtRes = await fetchRoomTypesByHotel(hotelsRes.data[0].id);
        setRoomTypes(rtRes.data || []);
      }
    } catch {
      // Ignored
    }
  };

  const handleLoginRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      if (authMode === 'register') {
        await registerUser(authForm);
      }
      const loginRes = await loginUser({
        email: authForm.email,
        password: authForm.password
      });
      localStorage.setItem('mystery_access_token', loginRes.data.accessToken);
      localStorage.setItem('mystery_user', JSON.stringify(loginRes.data.user));
      setCurrentUser(loginRes.data.user);
      setAuthMessage({ type: 'success', text: `Signed in as ${loginRes.data.user.fullName}` });
      loadUserBookings();
      if (loginRes.data.user.role === 'ROLE_HOTEL_MANAGER' || loginRes.data.user.role === 'ROLE_ADMIN') {
        loadPartnerData();
      }
      setActiveSection('deals');
    } catch (err) {
      setAuthMessage({
        type: 'error',
        text: err.response?.data?.message || 'Authentication failed. Please check credentials.'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setMyBookings([]);
    setMyHotels([]);
    setActiveBooking(null);
    setActiveSection('explore');
  };

  // Run DSA Search
  const handleRunSearch = async (overrideCity) => {
    setSearchLoading(true);
    setActiveStayWindow(null);
    setShowSearchDropdown(false);
    try {
      const params = {};
      const targetCity = overrideCity !== undefined ? overrideCity : (searchFilters.city || searchQuery);
      if (targetCity && targetCity !== 'All') params.city = targetCity;
      if (searchFilters.minRating) params.minRating = parseInt(searchFilters.minRating, 10);
      if (searchFilters.maxPrice) params.maxPrice = parseFloat(searchFilters.maxPrice);
      if (searchFilters.k) params.k = parseInt(searchFilters.k, 10);
      if (searchFilters.sortBy) params.sortBy = searchFilters.sortBy;
      if (searchFilters.amenities && searchFilters.amenities.length > 0) {
        params.amenities = searchFilters.amenities.join(',');
      }

      const res = await searchMysteryDeals(params);
      setSearchResult(res.data);
      setActiveSection('dsa');
    } catch {
      // Ignored
    } finally {
      setSearchLoading(false);
    }
  };

  // Sliding Window Stay Optimizer
  const handleCalculateBestWindow = async (dealId, stayLength = 3) => {
    setStayWindowLoading(true);
    try {
      const res = await fetchBestStayWindow(dealId, stayLength);
      setActiveStayWindow(res.data);
      setActiveSection('dsa');
    } catch {
      // Ignored
    } finally {
      setStayWindowLoading(false);
    }
  };

  // Open Checkout Modal
  const openBookingModal = (deal) => {
    setSelectedDealForBooking(deal);
    setActiveBooking(null);
    setCountdownSeconds(900); // 15 mins
    if (bookingDialogRef.current) {
      bookingDialogRef.current.showModal();
    }
  };

  const closeBookingModal = () => {
    if (bookingDialogRef.current) {
      bookingDialogRef.current.close();
    }
    setSelectedDealForBooking(null);
  };

  // Execute Booking (Phase 7 Concurrency & Pessimistic Hold)
  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setActiveSection('auth');
      closeBookingModal();
      return;
    }
    setBookingSubmitting(true);
    try {
      const payload = {
        mysteryDealId: selectedDealForBooking.dealId,
        checkInDate: bookingFormData.checkInDate,
        checkOutDate: bookingFormData.checkOutDate,
        roomCount: parseInt(bookingFormData.roomCount, 10),
        adultCount: parseInt(bookingFormData.adultCount, 10),
        childCount: 0,
        guestName: bookingFormData.guestName,
        guestEmail: bookingFormData.guestEmail,
        guestPhone: bookingFormData.guestPhone,
        specialRequests: bookingFormData.specialRequests
      };
      const res = await createBooking(payload);
      setActiveBooking(res.data);
      setCountdownSeconds(res.data.secondsRemaining || 900);
      loadUserBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking reservation failed. Insufficient inventory.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Confirm Booking & Trigger Secret Hotel Identity Reveal
  const handleConfirmReservation = async (bookingId) => {
    setBookingSubmitting(true);
    try {
      const res = await confirmBooking(bookingId);
      setActiveBooking(res.data);
      loadUserBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Confirmation failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this reservation? Released rooms are restored to the inventory ledger.')) return;
    try {
      await cancelBooking(bookingId);
      loadUserBookings();
      if (activeBooking && activeBooking.bookingId === bookingId) {
        closeBookingModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  // Filtered deals
  const filteredDeals = selectedCity === 'All'
    ? deals
    : deals.filter((d) => d.city.toLowerCase() === selectedCity.toLowerCase());

  // Search recommendations suggestions
  const citySuggestions = ['Bangalore', 'Mumbai', 'Goa', 'Delhi'];
  const clueSuggestions = ['Rooftop Infinity Pool', 'Luxury Wellness Spa', 'Private Beachfront Villa', 'Fine Dining Restaurant'];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. APPLE FLAGSHIP NAVIGATION BAR (https://www.apple.com/in/ design) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[rgba(22,22,23,0.8)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1024px] mx-auto px-4 h-12 flex items-center justify-between text-xs tracking-tight">
          {/* Apple-Style Emblem Logo */}
          <div
            onClick={() => setActiveSection('explore')}
            className="flex items-center space-x-2 cursor-pointer opacity-90 hover:opacity-100 transition"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0071e3] via-[#bf5af2] to-[#ffd60a] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#f5f5f7]">MysteryStay</span>
          </div>

          {/* Apple Horizontal Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-[#ceced2] font-normal text-[12px]">
            <button
              onClick={() => setActiveSection('explore')}
              className={`hover:text-[#f5f5f7] transition ${activeSection === 'explore' ? 'text-white font-medium' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('deals')}
              className={`hover:text-[#f5f5f7] transition ${activeSection === 'deals' ? 'text-white font-medium' : ''}`}
            >
              Secret Stays
            </button>
            <button
              onClick={() => setActiveSection('dsa')}
              className={`hover:text-[#f5f5f7] transition ${activeSection === 'dsa' ? 'text-white font-medium' : ''}`}
            >
              Algorithm (DSA)
            </button>
            <button
              onClick={() => {
                setActiveSection('trips');
                if (currentUser) loadUserBookings();
              }}
              className={`hover:text-[#f5f5f7] transition ${activeSection === 'trips' ? 'text-white font-medium' : ''}`}
            >
              My Trips
            </button>
            <button
              onClick={() => {
                setActiveSection('partner');
                if (currentUser) loadPartnerData();
              }}
              className={`hover:text-[#f5f5f7] transition ${activeSection === 'partner' ? 'text-white font-medium' : ''}`}
            >
              Hotel Partners
            </button>
          </nav>

          {/* Right Action: User Status / Apple Sign In Button */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-[#1d1d1f] px-3 py-1 rounded-full border border-white/10 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
                <span className="text-[#ceced2] font-medium">{currentUser.fullName.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-[#86868b] hover:text-[#ff453a] ml-1" title="Sign Out">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveSection('auth')}
                className="px-3.5 py-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-medium transition shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. APPLE SPOTLIGHT SEARCH WITH RECOMMENDATIONS & SUGGESTIONS */}
      {/* ========================================================================= */}
      <section className="bg-[#161617] border-b border-white/[0.06] py-3.5 sticky top-12 z-40 backdrop-blur-xl">
        <div className="max-w-[1024px] mx-auto px-4">
          <div ref={searchContainerRef} className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunSearch();
                }}
                placeholder="Search by city, luxury amenity, or hotel clue (e.g. Bangalore, Infinity Pool)..."
                className="w-full bg-[#1c1c1e] text-[#f5f5f7] placeholder-[#86868b] rounded-full pl-10 pr-24 py-2 text-xs border border-white/[0.08] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-inner"
              />
              <button
                onClick={() => handleRunSearch()}
                className="absolute right-1.5 px-3 py-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-medium transition"
              >
                Search
              </button>
            </div>

            {/* Apple Autocomplete Dropdown Recommendations & Suggestions */}
            {showSearchDropdown && (
              <div className="absolute top-11 left-0 right-0 bg-[#1c1c1e] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden z-50 p-3 space-y-3 text-xs animate-in fade-in zoom-in-95">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] px-2 block mb-1.5">
                    Popular Destinations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {citySuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchQuery(city);
                          setSelectedCity(city);
                          handleRunSearch(city);
                        }}
                        className="px-3 py-1 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#f5f5f7] text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-[#0071e3]" />
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] px-2 block mb-1.5">
                    Trending Luxury Clues (Inverted Index)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {clueSuggestions.map((clue) => (
                      <button
                        key={clue}
                        type="button"
                        onClick={() => {
                          setSearchQuery(clue);
                          setSearchFilters((prev) => ({
                            ...prev,
                            amenities: [clue]
                          }));
                          handleRunSearch();
                        }}
                        className="px-3 py-1 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#ffd60a] text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-[#ffd60a]" />
                        {clue}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Autocomplete Matching Deals */}
                {searchQuery.trim().length > 0 && (
                  <div className="border-t border-white/[0.06] pt-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] px-2 block mb-1.5">
                      Matching Mystery Drops
                    </span>
                    <div className="space-y-1">
                      {deals
                        .filter(
                          (d) =>
                            d.mysteryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.zoneArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (d.amenityClues &&
                              d.amenityClues.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())))
                        )
                        .slice(0, 3)
                        .map((matched) => (
                          <div
                            key={matched.dealId}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              openBookingModal(matched);
                            }}
                            className="p-2 rounded-xl hover:bg-[#2c2c2e] cursor-pointer flex items-center justify-between transition text-xs group"
                          >
                            <div className="truncate pr-3">
                              <div className="text-white font-medium truncate group-hover:text-[#2997ff] transition-colors">
                                {matched.mysteryTitle}
                              </div>
                              <div className="text-[10px] text-[#86868b]">
                                {matched.zoneArea}, {matched.city} • {matched.roomCategory}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[#30d158] font-mono font-bold">${matched.mysteryPrice.toFixed(2)}</div>
                              <div className="text-[10px] text-[#ffd60a] font-medium">{matched.discountPercent}% OFF</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN UNIFIED VIEWPORT */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1024px] mx-auto px-4 py-8 w-full space-y-16">
        {/* ========================================================================= */}
        {/* VIEW 1: APPLE BILLBOARD OVERVIEW (LANDING PAGE) */}
        {/* ========================================================================= */}
        {activeSection === 'explore' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            {/* Apple Hero Billboard */}
            <div className="text-center pt-8 pb-4 space-y-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#ffd60a]">
                Exclusive Luxury • Perishable Room Monetization
              </span>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#f5f5f7] leading-none">
                MysteryStay <span className="bg-gradient-to-r from-[#0071e3] via-[#bf5af2] to-[#ffd60a] bg-clip-text text-transparent">Pro</span>
              </h1>
              <p className="text-lg sm:text-2xl text-[#86868b] font-normal max-w-2xl mx-auto leading-relaxed">
                Unsold 5-star inventory. Identity strictly masked.<br className="hidden sm:inline" />
                Revealed exclusively upon booking confirmation.
              </p>

              <div className="flex items-center justify-center space-x-4 pt-4">
                <button
                  onClick={() => setActiveSection('deals')}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition shadow-lg shadow-[#0071e3]/20"
                >
                  Explore Secret Stays
                </button>
                <button
                  onClick={() => setActiveSection('dsa')}
                  className="text-xs text-[#2997ff] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>How the Algorithm Works</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Apple Bento Grid Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Bento Card 1: Identity Masking (USP) */}
              <div className="md:col-span-2 bg-[#161617] rounded-[28px] p-8 border border-white/[0.08] flex flex-col justify-between relative overflow-hidden group">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#bf5af2]/10 flex items-center justify-center text-[#bf5af2]">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-[#bf5af2] tracking-wider block">Core Innovation</span>
                  <h3 className="text-2xl font-bold text-white">Rate Parity Protected.</h3>
                  <p className="text-xs text-[#86868b] leading-relaxed max-w-md">
                    Hotels monetize perishable suites at 20% to 70% discounts without cannibalizing public brand rates.
                    Property names and street addresses remain completely confidential until verified reservation.
                  </p>
                </div>
                <div className="pt-8 flex items-center gap-2 text-xs text-[#2997ff] font-medium">
                  <span>Browse live masked deals</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Bento Card 2: Concurrency & Lock */}
              <div className="bg-[#161617] rounded-[28px] p-8 border border-white/[0.08] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#30d158]/10 flex items-center justify-center text-[#30d158]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-[#30d158] tracking-wider block">Pessimistic Locking</span>
                  <h3 className="text-xl font-bold text-white">Zero Double Booking.</h3>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    Powered by row-level database locks preventing race conditions across multi-night stays.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#86868b]">10 Simultaneous Threads Tested</span>
              </div>

              {/* Bento Card 3: Min-Heap Top-K */}
              <div className="bg-[#161617] rounded-[28px] p-8 border border-white/[0.08] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#ffd60a]/10 flex items-center justify-center text-[#ffd60a]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-[#ffd60a] tracking-wider block">Bounded Min-Heap</span>
                  <h3 className="text-xl font-bold text-white">O(N log K) Ranker.</h3>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    Surfaces top-K luxury values in &lt;200 µs without sorting large datasets.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('dsa')}
                  className="text-xs text-[#2997ff] hover:underline flex items-center gap-1 font-medium pt-4"
                >
                  <span>Inspect benchmark</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bento Card 4: Sliding Window */}
              <div className="md:col-span-2 bg-[#161617] rounded-[28px] p-8 border border-white/[0.08] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-[#0071e3] tracking-wider block">Sliding Window O(D)</span>
                  <h3 className="text-2xl font-bold text-white">Cheapest Stay Window Optimizer.</h3>
                  <p className="text-xs text-[#86868b] leading-relaxed max-w-lg">
                    Computes the lowest consecutive stay cost in linear time by shifting rolling sums, detecting weekend rate drops automatically.
                  </p>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => setActiveSection('deals')}
                    className="px-4 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#f5f5f7] text-xs font-semibold border border-white/10 transition"
                  >
                    Try on Live Stays
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Featured Mystery Drops (Unified Landing Page Showcase) */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffd60a] block">
                    Curated Spotlight
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Today's Featured Drops</h2>
                </div>
                <button
                  onClick={() => setActiveSection('deals')}
                  className="text-xs text-[#2997ff] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View All Secret Stays ({deals.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {deals.slice(0, 2).map((deal) => (
                  <div
                    key={deal.dealId}
                    className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1c1c1e] text-[#86868b] font-medium border border-white/5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0071e3]" />
                          {deal.zoneArea}, {deal.city}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] font-bold flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {deal.discountPercent}% OFF
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#bf5af2] mb-1">
                        {deal.roomCategory} • {deal.starRating}-Star Luxury
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#2997ff] transition-colors mb-2">
                        {deal.mysteryTitle}
                      </h3>
                      <p className="text-xs text-[#86868b] leading-relaxed mb-4">
                        {deal.descriptionClues}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#86868b] line-through block font-mono">
                          ${deal.originalPrice.toFixed(2)} retail
                        </span>
                        <div className="text-xl font-bold text-[#30d158] font-mono">
                          ${deal.mysteryPrice.toFixed(2)}
                          <span className="text-xs text-[#86868b] font-normal"> / night</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openBookingModal(deal)}
                        className="px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CURATED SECRET DEALS (APPLE PRODUCT CARD GRID) */}
        {/* ========================================================================= */}
        {activeSection === 'deals' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Destination Pill Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Curated Secret Stays</h2>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Verified 5-star suites with identity protection. Identity unlocked upon booking.
                </p>
              </div>

              {/* Destination Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-[#161617] p-1 rounded-full border border-white/[0.08]">
                {['All', 'Bangalore', 'Mumbai', 'Goa', 'Delhi'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
                      selectedCity === city
                        ? 'bg-[#0071e3] text-white shadow'
                        : 'text-[#86868b] hover:text-[#f5f5f7]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.dealId}
                  className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  {/* Card Header & Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1c1c1e] text-[#86868b] font-medium border border-white/5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0071e3]" />
                        {deal.zoneArea}, {deal.city}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] font-bold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {deal.discountPercent}% OFF
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#bf5af2] mb-1">
                      {deal.roomCategory} • {deal.starRating}-Star Luxury
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#2997ff] transition-colors mb-2">
                      {deal.mysteryTitle}
                    </h3>
                    <p className="text-xs text-[#86868b] leading-relaxed mb-4">
                      {deal.descriptionClues}
                    </p>

                    {/* Amenity Clue Chips */}
                    {deal.amenityClues && deal.amenityClues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {deal.amenityClues.map((clue, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#1c1c1e] text-[#ceced2] px-2 py-0.5 rounded-md border border-white/5"
                          >
                            {clue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Ledger & Action */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#86868b] line-through block font-mono">
                        ${deal.originalPrice.toFixed(2)} retail
                      </span>
                      <div className="text-xl font-bold text-[#30d158] font-mono">
                        ${deal.mysteryPrice.toFixed(2)}
                        <span className="text-xs text-[#86868b] font-normal"> / night</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCalculateBestWindow(deal.dealId, 3)}
                        className="p-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#86868b] hover:text-[#30d158] border border-white/10 transition"
                        title="Calculate optimal 3-night consecutive stay window"
                      >
                        <TrendingDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openBookingModal(deal)}
                        className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: DSA RECOMMENDATION ENGINE (ALGORITHMIC PLAYGROUND) */}
        {/* ========================================================================= */}
        {activeSection === 'dsa' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-white/[0.08] pb-6">
              <span className="text-xs font-semibold uppercase text-[#ffd60a] block mb-1">
                Data Structures & Algorithms
              </span>
              <h2 className="text-3xl font-bold text-white">Algorithmic Recommendation Engine</h2>
              <p className="text-xs text-[#86868b] mt-1 max-w-xl">
                Demonstrating bounded Min-Heap rankers (PriorityQueue), multi-attribute inverted index intersections, and sliding window price optimizers.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5">Destination City</label>
                  <input
                    type="text"
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    placeholder="e.g. Bangalore, Mumbai, Goa"
                    className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5">Min Star Tier</label>
                  <select
                    value={searchFilters.minRating}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value })}
                    className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="">Any Star Rating</option>
                    <option value="4">4★ & Above</option>
                    <option value="5">5★ Luxury Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5">Top-K Heap Sizing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSearchFilters({ ...searchFilters, k })}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
                          searchFilters.k === k
                            ? 'bg-[#0071e3] border-[#0071e3] text-white'
                            : 'bg-[#1c1c1e] border-white/5 text-[#86868b] hover:text-white'
                        }`}
                      >
                        Top {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenity Chips */}
              <div>
                <label className="block text-[11px] font-semibold text-[#86868b] mb-2">
                  Inverted Index Clues (Set Intersection)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Rooftop Infinity Pool',
                    'Luxury Wellness Spa',
                    'Fine Dining Restaurant',
                    'Cocktail Lounge & Bar',
                    'Free High-Speed WiFi'
                  ].map((amenity) => {
                    const isSelected = searchFilters.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          setSearchFilters((prev) => ({
                            ...prev,
                            amenities: isSelected
                              ? prev.amenities.filter((a) => a !== amenity)
                              : [...prev.amenities, amenity]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition border ${
                          isSelected
                            ? 'bg-[#ffd60a]/20 text-[#ffd60a] border-[#ffd60a]/40 font-semibold'
                            : 'bg-[#1c1c1e] text-[#86868b] border-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleRunSearch()}
                  disabled={searchLoading}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md"
                >
                  <Zap className={`w-3.5 h-3.5 ${searchLoading ? 'animate-spin' : ''}`} />
                  <span>{searchLoading ? 'Ranking...' : 'Execute Min-Heap Ranker'}</span>
                </button>
              </div>
            </div>

            {/* Performance Telemetry */}
            {searchResult && (
              <div className="bg-[#161617] rounded-2xl p-4 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-2 text-[#2997ff]">
                  <Zap className="w-4 h-4 text-[#ffd60a]" />
                  <span className="font-semibold">{searchResult.algorithmUsed}</span>
                </div>
                <div className="flex items-center space-x-4 text-[#86868b] font-mono text-xs">
                  <span>Evaluated: <strong className="text-white">{searchResult.totalCandidatesEvaluated}</strong></span>
                  <span>•</span>
                  <span>Returned: <strong className="text-[#30d158]">{searchResult.returnedCount}</strong></span>
                  <span>•</span>
                  <span>Latency: <strong className="text-[#ffd60a]">{searchResult.executionTimeMicros} µs</strong></span>
                </div>
              </div>
            )}

            {/* Sliding Window Optimization Card */}
            {activeStayWindow && (
              <div className="bg-[#161617] border border-[#30d158]/30 rounded-[24px] p-6 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center space-x-2 text-[#30d158] font-bold text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Sliding Window: Optimal {activeStayWindow.stayLength}-Night Stay Window</span>
                  </div>
                  <span className="text-xs font-mono text-[#86868b]">
                    {activeStayWindow.algorithmUsed} ({activeStayWindow.executionTimeMicros} µs)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[#86868b] block text-[10px]">Optimal Check-In</span>
                    <strong className="text-white font-mono">{activeStayWindow.bestCheckInDate}</strong>
                  </div>
                  <div>
                    <span className="text-[#86868b] block text-[10px]">Optimal Check-Out</span>
                    <strong className="text-white font-mono">{activeStayWindow.bestCheckOutDate}</strong>
                  </div>
                  <div>
                    <span className="text-[#86868b] block text-[10px]">Total Cost</span>
                    <strong className="text-[#30d158] text-sm font-mono font-bold">${activeStayWindow.totalCost.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[#86868b] block text-[10px]">Savings vs Peak</span>
                    <strong className="text-[#ffd60a] text-sm font-mono font-bold">+${activeStayWindow.savingsVsWorstWindow.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {searchResult && searchResult.deals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResult.deals.map((item, idx) => (
                  <div key={item.deal.dealId} className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#0071e3] font-bold">
                        Rank #{idx + 1} • ValueScore: {item.valueScore.toFixed(2)}
                      </span>
                      <span className="text-[#ffd60a] font-bold">{item.deal.discountPercent}% OFF</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.deal.mysteryTitle}</h4>
                    <p className="text-xs text-[#86868b] line-clamp-2">{item.deal.descriptionClues}</p>
                    <div className="text-[10px] font-mono text-[#bf5af2] bg-[#1c1c1e] p-2 rounded-xl border border-white/5">
                      {item.explanation}
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                      <div className="text-lg font-bold text-[#30d158] font-mono">
                        ${item.deal.mysteryPrice.toFixed(2)}/nt
                      </div>
                      <button
                        onClick={() => openBookingModal(item.deal)}
                        className="px-4 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-semibold"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: MY TRIPS & SECRET IDENTITY UNLOCK (PHASE 7 STATE MACHINE) */}
        {/* ========================================================================= */}
        {activeSection === 'trips' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-white/[0.08] pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">My Reservations</h2>
                <p className="text-xs text-[#86868b] mt-1">
                  Manage confidential reservations and complete payments to unlock confidential hotel identities.
                </p>
              </div>
              {currentUser && (
                <button
                  onClick={loadUserBookings}
                  disabled={bookingsLoading}
                  className="text-xs text-[#0071e3] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="bg-[#161617] rounded-[28px] p-12 text-center border border-white/[0.08] space-y-4 max-w-md mx-auto">
                <User className="w-10 h-10 text-[#86868b] mx-auto" />
                <h3 className="text-lg font-bold text-white">Sign In to View Trips</h3>
                <p className="text-xs text-[#86868b]">
                  Please sign in to track your reservation state machine and unlock hotel credentials.
                </p>
                <button
                  onClick={() => setActiveSection('auth')}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] text-white text-xs font-semibold"
                >
                  Sign In
                </button>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="bg-[#161617] rounded-[28px] p-12 text-center border border-white/[0.08] space-y-3">
                <Calendar className="w-10 h-10 text-[#86868b] mx-auto" />
                <h3 className="text-base font-bold text-white">No active trips</h3>
                <p className="text-xs text-[#86868b]">Browse secret deals and book your next getaway.</p>
                <button
                  onClick={() => setActiveSection('deals')}
                  className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-xs font-semibold"
                >
                  Explore Stays
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myBookings.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isPending = b.status === 'PENDING_PAYMENT';
                  return (
                    <div
                      key={b.bookingId}
                      className={`bg-[#161617] rounded-[24px] p-6 border transition-all ${
                        isConfirmed ? 'border-[#30d158]/30 shadow-lg shadow-[#30d158]/5' : 'border-white/[0.08]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-xs mb-1">
                            <span className="font-mono text-[#0071e3] font-bold">{b.bookingReference}</span>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isConfirmed
                                  ? 'bg-[#30d158]/15 text-[#30d158]'
                                  : isPending
                                  ? 'bg-[#ffd60a]/15 text-[#ffd60a] animate-pulse'
                                  : 'bg-[#ff453a]/15 text-[#ff453a]'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {isConfirmed ? (
                              <>
                                <Unlock className="w-5 h-5 text-[#30d158]" />
                                <span>{b.hotelName}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 text-[#ffd60a]" />
                                <span>Confidential 5-Star Hotel ({b.zoneArea}, {b.city})</span>
                              </>
                            )}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isPending && (
                            <button
                              onClick={() => handleConfirmReservation(b.bookingId)}
                              className="px-4 py-2 rounded-full bg-[#30d158] hover:bg-[#32d74b] text-black text-xs font-bold transition flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Complete Payment</span>
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && (
                            <button
                              onClick={() => handleCancelBooking(b.bookingId)}
                              className="px-3 py-2 rounded-full bg-[#1c1c1e] text-[#ff453a] hover:bg-[#2c2c2e] text-xs font-medium border border-white/10 transition"
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Secret Hotel Reveal Card */}
                      {isConfirmed && (
                        <div className="mt-4 p-4 rounded-xl bg-[#30d158]/10 border border-[#30d158]/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#30d158] block mb-0.5">
                              Secret Identity Revealed
                            </span>
                            <div className="text-white font-medium flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#30d158]" />
                              <span>{b.hotelAddress}</span>
                            </div>
                          </div>
                          {b.hotelPhone && (
                            <div className="text-[#86868b] font-mono text-xs">
                              Concierge: <strong className="text-white">{b.hotelPhone}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-[#86868b] block text-[10px]">Dates</span>
                          <strong className="text-white font-mono">{b.checkInDate} → {b.checkOutDate}</strong>
                        </div>
                        <div>
                          <span className="text-[#86868b] block text-[10px]">Room Category</span>
                          <strong className="text-white">{b.roomTypeName} ({b.stayNights} Nights)</strong>
                        </div>
                        <div>
                          <span className="text-[#86868b] block text-[10px]">Guest</span>
                          <strong className="text-white">{b.guestName}</strong>
                        </div>
                        <div>
                          <span className="text-[#86868b] block text-[10px]">Total Amount</span>
                          <strong className="text-[#30d158] font-mono font-bold text-sm">${b.totalAmount.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: HOTEL PARTNER & DEAL PUBLISHER */}
        {/* ========================================================================= */}
        {activeSection === 'partner' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-white/[0.08] pb-6">
              <span className="text-xs font-semibold uppercase text-[#ffd60a] block mb-1">
                Hotel Management Portal
              </span>
              <h2 className="text-3xl font-bold text-white">Partner Property Control Room</h2>
              <p className="text-xs text-[#86868b] mt-1">
                Onboard properties, define luxury suites, seed room calendars, and monetize unsold inventory with mystery discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hotel Onboarding */}
              <div className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0071e3]" />
                  Onboard Luxury Property
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setManagerMessage(null);
                    try {
                      await createHotel({
                        name: hotelForm.name,
                        brandChain: hotelForm.brandChain,
                        starRating: parseInt(hotelForm.starRating, 10),
                        address: hotelForm.address,
                        city: hotelForm.city,
                        zoneArea: hotelForm.zoneArea,
                        postalCode: hotelForm.postalCode,
                        phone: hotelForm.phone,
                        email: hotelForm.email,
                        latitude: 12.9716,
                        longitude: 77.5946,
                        amenityIds: hotelForm.selectedAmenities
                      });
                      setManagerMessage({ type: 'success', text: 'Hotel property onboarded successfully!' });
                      loadPartnerData();
                    } catch (err) {
                      setManagerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to onboard property' });
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Property Name</label>
                    <input
                      type="text"
                      value={hotelForm.name}
                      onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">City</label>
                      <input
                        type="text"
                        value={hotelForm.city}
                        onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                        className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">Zone / Area</label>
                      <input
                        type="text"
                        value={hotelForm.zoneArea}
                        onChange={(e) => setHotelForm({ ...hotelForm, zoneArea: e.target.value })}
                        className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#0071e3] text-white text-xs font-semibold"
                  >
                    Register Property
                  </button>
                </form>
              </div>

              {/* Deal Publisher */}
              <div className="bg-[#161617] rounded-[24px] p-6 border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#ffd60a]" />
                  Publish Mystery Deal
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!dealPublishForm.roomTypeId) {
                      alert('Select a valid Room Category.');
                      return;
                    }
                    try {
                      await createMysteryDeal({
                        roomTypeId: parseInt(dealPublishForm.roomTypeId, 10),
                        mysteryTitle: dealPublishForm.mysteryTitle,
                        descriptionClues: dealPublishForm.descriptionClues,
                        discountPercent: parseInt(dealPublishForm.discountPercent, 10),
                        validFrom: dealPublishForm.validFrom,
                        validTo: dealPublishForm.validTo
                      });
                      setManagerMessage({ type: 'success', text: 'Mystery deal published successfully!' });
                      loadDeals();
                    } catch (err) {
                      setManagerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to publish deal' });
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Room Category</label>
                    <select
                      value={dealPublishForm.roomTypeId}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, roomTypeId: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    >
                      <option value="">Select Suite</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (${rt.basePrice}/nt)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Clue Title (Masked)</label>
                    <input
                      type="text"
                      value={dealPublishForm.mysteryTitle}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, mysteryTitle: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">
                      Discount: <strong className="text-[#ffd60a]">{dealPublishForm.discountPercent}%</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="5"
                      value={dealPublishForm.discountPercent}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, discountPercent: e.target.value })}
                      className="w-full accent-[#0071e3]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#0071e3] text-white text-xs font-semibold"
                  >
                    Publish Masked Deal
                  </button>
                </form>
              </div>
            </div>

            {managerMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium ${
                  managerMessage.type === 'success' ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}
              >
                {managerMessage.text}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: AUTHENTICATION / ACCOUNT SWITCHER */}
        {/* ========================================================================= */}
        {activeSection === 'auth' && (
          <div className="max-w-md mx-auto space-y-6 pt-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'login' ? 'Sign In with MysteryStay ID' : 'Create MysteryStay ID'}
              </h2>
              <p className="text-xs text-[#86868b]">
                Seamless switching between Customer, Hotel Manager, and Administrator accounts.
              </p>
            </div>

            <div className="bg-[#161617] rounded-[28px] p-8 border border-white/[0.08] space-y-5">
              {/* Quick Switch Presets */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block mb-2">
                  Quick Role Switcher
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Traveler', email: 'customer@mysterystay.com', role: 'ROLE_CUSTOMER' },
                    { label: 'Manager', email: 'manager@grandazure.com', role: 'ROLE_HOTEL_MANAGER' },
                    { label: 'Admin', email: 'admin@mysterystay.com', role: 'ROLE_ADMIN' }
                  ].map((preset) => (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => {
                        setAuthForm((prev) => ({
                          ...prev,
                          email: preset.email,
                          role: preset.role,
                          fullName: preset.label === 'Traveler' ? 'Alex Morgan' : preset.label === 'Manager' ? 'Robert Sterling' : 'Victoria Vance'
                        }));
                      }}
                      className="px-2 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[11px] font-medium text-[#f5f5f7] border border-white/5 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginRegister} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] text-[#86868b] mb-1">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#86868b] mb-1">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition"
                >
                  {authLoading ? 'Signing In...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-[#2997ff] hover:underline"
                >
                  {authMode === 'login' ? "Don't have an ID? Create one" : 'Have an ID? Sign in'}
                </button>
              </div>

              {authMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    authMessage.type === 'success' ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-[#ff453a]/15 text-[#ff453a]'
                  }`}
                >
                  {authMessage.text}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. NATIVE MODAL CHECKOUT & HOTEL IDENTITY REVEAL (MODERN WEB GUIDANCE) */}
      {/* ========================================================================= */}
      <dialog
        ref={bookingDialogRef}
        aria-labelledby="booking-title"
        className="bg-[#1c1c1e] text-[#f5f5f7] rounded-[28px] p-7 max-w-md w-full border border-white/[0.12] shadow-2xl m-auto focus:outline-none"
      >
        {selectedDealForBooking && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0071e3] font-bold block">
                  Reserve Mystery Stay
                </span>
                <h3 id="booking-title" className="text-base font-bold text-white mt-0.5">
                  {selectedDealForBooking.mysteryTitle}
                </h3>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-1 rounded-full text-[#86868b] hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage 1: Checkout Form */}
            {!activeBooking && (
              <form onSubmit={handleInitiateBooking} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#2c2c2e] text-xs space-y-1">
                  <div className="flex justify-between text-[#86868b]">
                    <span>Location Clue:</span>
                    <strong className="text-white">{selectedDealForBooking.zoneArea}, {selectedDealForBooking.city}</strong>
                  </div>
                  <div className="flex justify-between text-[#86868b]">
                    <span>Mystery Price:</span>
                    <strong className="text-[#30d158] font-mono">${selectedDealForBooking.mysteryPrice.toFixed(2)}/nt</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Check-In</label>
                    <input
                      type="date"
                      value={bookingFormData.checkInDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Check-Out</label>
                    <input
                      type="date"
                      value={bookingFormData.checkOutDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#86868b] mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    value={bookingFormData.guestName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[11px] text-[#2997ff] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Pessimistic row locking holds room for 15 minutes.</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition"
                >
                  {bookingSubmitting ? 'Locking Inventory...' : 'Lock Reservation (15-Min Hold)'}
                </button>
              </form>
            )}

            {/* Stage 2: 15-Minute Countdown Hold */}
            {activeBooking && activeBooking.status === 'PENDING_PAYMENT' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-xl bg-[#ffd60a]/10 border border-[#ffd60a]/20 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#ffd60a] block font-bold">
                    Reservation Hold Active
                  </span>
                  <div className="text-3xl font-bold text-[#ffd60a] font-mono flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span>
                      {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#86868b] block font-mono">
                    Ref: {activeBooking.bookingReference}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#2c2c2e] text-xs space-y-1">
                  <div className="flex justify-between text-[#86868b]">
                    <span>Total Amount:</span>
                    <strong className="text-[#30d158] font-mono text-sm">${activeBooking.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[#86868b]">
                    <span>Stay Duration:</span>
                    <strong className="text-white">{activeBooking.stayNights} Nights</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmReservation(activeBooking.bookingId)}
                  disabled={bookingSubmitting}
                  className="w-full py-2.5 rounded-full bg-[#30d158] hover:bg-[#32d74b] text-black text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Confirm & Reveal Secret Hotel Identity</span>
                </button>
              </div>
            )}

            {/* Stage 3: Confirmed & Secret Hotel Identity Unlocked! */}
            {activeBooking && activeBooking.status === 'CONFIRMED' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-[#30d158] uppercase font-bold tracking-wider block">
                    Confirmed • Secret Revealed
                  </span>
                  <h3 className="text-xl font-bold text-white">{activeBooking.hotelName}</h3>
                </div>

                <div className="p-3.5 rounded-xl bg-[#2c2c2e] text-xs space-y-2">
                  <div>
                    <span className="text-[10px] text-[#86868b] block">Street Address</span>
                    <strong className="text-white flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#30d158]" />
                      {activeBooking.hotelAddress}
                    </strong>
                  </div>
                  {activeBooking.hotelPhone && (
                    <div>
                      <span className="text-[10px] text-[#86868b] block">Direct Concierge</span>
                      <strong className="text-white font-mono">{activeBooking.hotelPhone}</strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    closeBookingModal();
                    setActiveSection('trips');
                  }}
                  className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-[#f5f5f7] transition"
                >
                  View in My Trips
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>

      {/* ========================================================================= */}
      {/* 5. APPLE FLAT FOOTER (https://www.apple.com/in/ style) */}
      {/* ========================================================================= */}
      <footer className="bg-[#161617] border-t border-white/[0.08] py-8 text-[11px] text-[#86868b]">
        <div className="max-w-[1024px] mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center space-x-2 text-[#ceced2]">
              <span className="font-semibold text-white">MysteryStay Architecture</span>
              <span>•</span>
              <span>Java 21 • Spring Boot 3.3.5 • MySQL 9.x • Redis • React 18 • Vite</span>
            </div>
            <div className="flex items-center space-x-3 font-mono">
              <span className="text-[#30d158]">● MySQL Connected</span>
              <span>•</span>
              <span>API v1.0.0-PRO</span>
            </div>
          </div>
          <p className="text-[#86868b] text-[10px] leading-relaxed">
            Copyright © 2026 MysteryStay Inc. All rights reserved. Identity masking protected by rate-parity algorithms.
            Unsold inventory monetization subject to partner hotel terms.
          </p>
        </div>
      </footer>
    </div>
  );
}
