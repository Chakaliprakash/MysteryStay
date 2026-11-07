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
  verifyHotelAdmin,
  createRoomType,
  fetchRoomTypesByHotel,
  seedRoomInventory,
  fetchPublicDeals,
  createMysteryDeal,
  fetchMyDeals,
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
  Eye,
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
  Layers,
  Compass,
  CreditCard,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('deals'); // 'deals' | 'search' | 'bookings' | 'manager' | 'auth'
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

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
  const [selectedCity, setSelectedCity] = useState('All');

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

  // Bookings state
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
    specialRequests: 'High floor with city skyline view'
  });
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [revealedBooking, setRevealedBooking] = useState(null);

  // Hotel Partner state
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [myHotels, setMyHotels] = useState([]);
  const [adminHotels, setAdminHotels] = useState([]);
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
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: 'Executive Balcony Suite',
    category: 'EXECUTIVE_SUITE',
    description: 'Palatial suite featuring a private balcony and Italian marble bath.',
    maxAdults: 2,
    maxChildren: 1,
    basePrice: '380.00'
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

  // Initialize
  useEffect(() => {
    loadHealth();
    loadDeals();
    loadAmenitiesList();
    checkCurrentUser();
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

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await checkSystemHealth();
      setHealth(res.data);
    } catch {
      // Ignored
    } finally {
      setHealthLoading(false);
    }
  };

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

  const loadAmenitiesList = async () => {
    try {
      const res = await fetchAmenities();
      setAmenitiesList(res.data || []);
    } catch {
      // Ignored
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

  const handleLoginRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      if (authMode === 'register') {
        await registerUser(authForm);
        setAuthMessage({ type: 'success', text: 'Registration successful! Signing in...' });
      }
      const loginRes = await loginUser({
        email: authForm.email,
        password: authForm.password
      });
      localStorage.setItem('mystery_access_token', loginRes.data.accessToken);
      localStorage.setItem('mystery_user', JSON.stringify(loginRes.data.user));
      setCurrentUser(loginRes.data.user);
      setAuthMessage({ type: 'success', text: `Welcome back, ${loginRes.data.user.fullName}!` });
      loadUserBookings();
      if (loginRes.data.user.role === 'ROLE_HOTEL_MANAGER' || loginRes.data.user.role === 'ROLE_ADMIN') {
        loadPartnerData();
      }
    } catch (err) {
      setAuthMessage({
        type: 'error',
        text: err.response?.data?.message || 'Authentication failed. Please verify credentials.'
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
    setRevealedBooking(null);
    setAuthMessage({ type: 'info', text: 'Logged out successfully.' });
  };

  const loadPartnerData = async () => {
    try {
      const [hotelsRes, adminRes] = await Promise.all([
        fetchMyHotels().catch(() => ({ data: [] })),
        fetchAdminHotels().catch(() => ({ data: [] }))
      ]);
      setMyHotels(hotelsRes.data || []);
      setAdminHotels(adminRes.data || []);
      if (hotelsRes.data && hotelsRes.data.length > 0) {
        setSelectedHotelId(hotelsRes.data[0].id);
        const rtRes = await fetchRoomTypesByHotel(hotelsRes.data[0].id);
        setRoomTypes(rtRes.data || []);
      }
    } catch {
      // Ignored
    }
  };

  // Run DSA Search
  const handleRunSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setActiveStayWindow(null);
    try {
      const params = {};
      if (searchFilters.city) params.city = searchFilters.city;
      if (searchFilters.minRating) params.minRating = parseInt(searchFilters.minRating, 10);
      if (searchFilters.maxPrice) params.maxPrice = parseFloat(searchFilters.maxPrice);
      if (searchFilters.k) params.k = parseInt(searchFilters.k, 10);
      if (searchFilters.sortBy) params.sortBy = searchFilters.sortBy;
      if (searchFilters.amenities && searchFilters.amenities.length > 0) {
        params.amenities = searchFilters.amenities.join(',');
      }

      const res = await searchMysteryDeals(params);
      setSearchResult(res.data);
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
    setRevealedBooking(null);
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
      setActiveTab('auth');
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
      setRevealedBooking(res.data);
      loadUserBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment confirmation failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this reservation? Inventory will be released.')) return;
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

  const filteredDeals = selectedCity === 'All'
    ? deals
    : deals.filter((d) => d.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Glow ambient background aura */}
      <div className="fixed inset-0 pointer-events-none glow-gradient z-0 opacity-80" />

      {/* Floating Apple-Style Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('deals')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                MysteryStay
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Luxe
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-full border border-white/5">
            {[
              { id: 'deals', label: 'Explore Stays', icon: Compass },
              { id: 'search', label: 'DSA Recommendations', icon: Zap },
              { id: 'bookings', label: 'My Trips', icon: Calendar },
              { id: 'manager', label: 'Partner Portal', icon: Building }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'bookings' && currentUser) loadUserBookings();
                    if (tab.id === 'manager' && currentUser) loadPartnerData();
                  }}
                  className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Health Status Action */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2.5 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-300 max-w-[120px] truncate">{currentUser.fullName}</span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  {currentUser.role === 'ROLE_HOTEL_MANAGER' ? 'Manager' : currentUser.role === 'ROLE_ADMIN' ? 'Admin' : 'Traveler'}
                </span>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 ml-1" title="Sign Out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition shadow-lg shadow-white/10"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-12 z-10">
        {/* ========================================================================= */}
        {/* TAB 1: EXPLORE MYSTERY DEALS */}
        {/* ========================================================================= */}
        {activeTab === 'deals' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Apple Keynote Style Hero */}
            <div className="text-center max-w-3xl mx-auto pt-6 pb-2 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>The Art of Anonymous Luxury • 20% to 70% Off Perishable Inventory</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Unsold Luxury.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
                  Unrivaled Pricing.
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
                Book verified 5-star hotel suites with complete rate discretion.
                The secret property identity is revealed exclusively upon confirmed reservation.
              </p>

              {/* City Pill Selector */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {['All', 'Bangalore', 'Mumbai', 'Goa', 'Delhi'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedCity === city
                        ? 'bg-white text-slate-950 shadow-md scale-105'
                        : 'bg-slate-900/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Mystery Deals Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Verified Secret Stays
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {filteredDeals.length} Available
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Strictly identity-masked to protect retail hotel rate parity.</p>
                </div>
                <button
                  onClick={loadDeals}
                  disabled={dealsLoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dealsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Grid</span>
                </button>
              </div>

              {filteredDeals.length === 0 ? (
                <div className="p-16 text-center text-sm text-slate-500 glass-card rounded-3xl border border-white/5">
                  No deals listed for this destination yet. Switch to "All" or publish a deal from the Partner Portal.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {filteredDeals.map((deal) => (
                    <div
                      key={deal.dealId}
                      className="glass-card rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:-translate-y-1"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400" />
                            {deal.zoneArea}, {deal.city}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {deal.starRating}-Star Luxury
                          </span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{deal.discountPercent}% OFF</span>
                        </div>
                      </div>

                      {/* Deal Content */}
                      <div className="space-y-3 mb-6">
                        <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                          <EyeOff className="w-3 h-3" />
                          <span>{deal.roomCategory} • {deal.maxAdults} Adults</span>
                        </div>
                        <h4 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                          {deal.mysteryTitle}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-normal">
                          {deal.descriptionClues}
                        </p>

                        {/* Clue Amenities */}
                        {deal.amenityClues && deal.amenityClues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {deal.amenityClues.map((clue, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg border border-white/5 font-medium"
                              >
                                {clue}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Reservation Footer */}
                      <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500 line-through font-mono">
                            ${deal.originalPrice.toFixed(2)}/night
                          </div>
                          <div className="text-2xl font-black text-emerald-400 tracking-tight">
                            ${deal.mysteryPrice.toFixed(2)}
                            <span className="text-xs font-normal text-slate-400"> / night</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCalculateBestWindow(deal.dealId, 3)}
                            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition"
                            title="Find cheapest 3 consecutive nights using Sliding Window"
                          >
                            <TrendingDown className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => openBookingModal(deal)}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/25 active:scale-95"
                          >
                            <span>Book Mystery Stay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DSA RECOMMENDATION & STAY WINDOW OPTIMIZER (PHASE 6) */}
        {/* ========================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="border-b border-white/10 pb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Big Tech Algorithmic Engine • PriorityQueue & Sliding Window</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">DSA-Powered Search & Recommendations</h2>
              <p className="text-slate-400 text-sm mt-1">
                Sub-millisecond set intersection across in-memory inverted indices and bounded Min-Heap value ranking.
              </p>
            </div>

            {/* Filter Hub */}
            <div className="glass-panel rounded-3xl p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Destination City</label>
                  <input
                    type="text"
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    placeholder="e.g. Bangalore, Mumbai, Goa"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Minimum Star Rating</label>
                  <select
                    value={searchFilters.minRating}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Any Star Rating</option>
                    <option value="4">4★ & Above</option>
                    <option value="5">5★ Luxury Exclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Nightly Rate ($)</label>
                  <input
                    type="number"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value })}
                    placeholder="e.g. 300"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Top-K Heap Capacity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSearchFilters({ ...searchFilters, k })}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          searchFilters.k === k
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Top {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenity Inverted Index Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Inverted Index Amenity Clues (Optimal Set Intersection)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Rooftop Infinity Pool',
                    'Luxury Wellness Spa',
                    'Fine Dining Restaurant',
                    'Cocktail Lounge & Bar',
                    'Free High-Speed WiFi',
                    'Airport Shuttle Service'
                  ].map((amenity) => {
                    const selected = searchFilters.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          setSearchFilters((prev) => ({
                            ...prev,
                            amenities: selected
                              ? prev.amenities.filter((a) => a !== amenity)
                              : [...prev.amenities, amenity]
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRunSearch}
                  disabled={searchLoading}
                  className="inline-flex items-center space-x-2 text-xs font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
                  <span>{searchLoading ? 'Executing Min-Heap...' : 'Run DSA Recommendation'}</span>
                </button>
              </div>
            </div>

            {/* Live Algorithmic Telemetry */}
            {searchResult && (
              <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 border border-indigo-500/20">
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{searchResult.algorithmUsed}</span>
                </div>
                <div className="flex items-center space-x-4 text-slate-400 font-mono text-xs">
                  <span>Evaluated: <strong className="text-white">{searchResult.totalCandidatesEvaluated}</strong></span>
                  <span>•</span>
                  <span>Top-K: <strong className="text-emerald-400">{searchResult.returnedCount}</strong></span>
                  <span>•</span>
                  <span>Latency: <strong className="text-amber-400">{searchResult.executionTimeMicros} µs</strong></span>
                </div>
              </div>
            )}

            {/* Sliding Window Result Output */}
            {activeStayWindow && (
              <div className="glass-panel border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <TrendingDown className="w-5 h-5" />
                    <span>Sliding Window: Optimal {activeStayWindow.stayLength}-Night Stay Window</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300">
                    {activeStayWindow.algorithmUsed} ({activeStayWindow.executionTimeMicros} µs)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Optimal Check-In</span>
                    <strong className="text-white font-mono text-sm">{activeStayWindow.bestCheckInDate}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Optimal Check-Out</span>
                    <strong className="text-white font-mono text-sm">{activeStayWindow.bestCheckOutDate}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Total Stay Cost</span>
                    <strong className="text-emerald-400 text-sm font-black">${activeStayWindow.totalCost.toFixed(2)}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Guest Savings vs Peak</span>
                    <strong className="text-amber-400 text-sm font-black">+${activeStayWindow.savingsVsWorstWindow.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Ranked Results Grid */}
            {searchResult && searchResult.deals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResult.deals.map((scored, idx) => (
                  <div key={scored.deal.dealId} className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                        Rank #{idx + 1} • Score: {scored.valueScore.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-amber-400">{scored.deal.discountPercent}% OFF</span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{scored.deal.zoneArea}, {scored.deal.city}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{scored.deal.mysteryTitle}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{scored.deal.descriptionClues}</p>
                      <div className="text-[10px] font-mono text-purple-300 bg-purple-950/40 border border-purple-800/30 p-2 rounded-xl">
                        {scored.explanation}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 line-through">${scored.deal.originalPrice.toFixed(2)}</div>
                        <div className="text-lg font-black text-emerald-400">${scored.deal.mysteryPrice.toFixed(2)}/nt</div>
                      </div>
                      <button
                        onClick={() => openBookingModal(scored.deal)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                      >
                        Book Stay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY RESERVATIONS & SECRET HOTEL REVEAL (PHASE 7) */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
                  My Reservations
                  <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    Phase 7 State Machine
                  </span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Track confidential reservations, complete 15-minute checkout holds, and view revealed hotel credentials.
                </p>
              </div>
              {currentUser && (
                <button
                  onClick={loadUserBookings}
                  disabled={bookingsLoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Bookings</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="p-16 text-center glass-card rounded-3xl border border-white/5 space-y-4">
                <User className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-lg font-bold text-white">Sign In to View Your Trips</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sign in or register an account to manage your confidential mystery hotel bookings.
                </p>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-6 py-2.5 rounded-full bg-white text-slate-950 text-xs font-bold transition shadow-lg"
                >
                  Go to Sign In
                </button>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="p-16 text-center glass-card rounded-3xl border border-white/5 space-y-3">
                <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No active bookings found</h4>
                <p className="text-xs text-slate-400">Browse mystery deals and reserve your first confidential luxury getaway.</p>
                <button
                  onClick={() => setActiveTab('deals')}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
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
                      className={`glass-panel rounded-3xl p-6 transition border ${
                        isConfirmed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-xs mb-1">
                            <span className="font-mono text-indigo-400 font-bold">{b.bookingReference}</span>
                            <span>•</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isConfirmed
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          {/* Hotel Title - Revealed vs Masked */}
                          <h3 className="text-xl font-black text-white flex items-center gap-2">
                            {isConfirmed ? (
                              <>
                                <Unlock className="w-5 h-5 text-emerald-400" />
                                <span>{b.hotelName}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 text-amber-400" />
                                <span>Confidential 5-Star Hotel ({b.zoneArea}, {b.city})</span>
                              </>
                            )}
                          </h3>
                        </div>

                        {/* Status Actions */}
                        <div className="flex items-center space-x-3">
                          {isPending && (
                            <button
                              onClick={() => handleConfirmReservation(b.bookingId)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Complete Payment</span>
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && (
                            <button
                              onClick={() => handleCancelBooking(b.bookingId)}
                              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition"
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Revealed Details Banner */}
                      {isConfirmed && (
                        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                              🎉 Secret Identity Unlocked
                            </span>
                            <p className="text-white font-medium flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              {b.hotelAddress}
                            </p>
                          </div>
                          {b.hotelPhone && (
                            <div className="text-slate-300 font-mono text-xs">
                              Concierge Phone: <strong className="text-white">{b.hotelPhone}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stay Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Dates of Stay</span>
                          <strong className="text-white font-mono">{b.checkInDate} → {b.checkOutDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Room Tier</span>
                          <strong className="text-white">{b.roomTypeName} ({b.stayNights} Nights)</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Guest Name</span>
                          <strong className="text-white">{b.guestName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Paid Amount</span>
                          <strong className="text-emerald-400 font-black text-sm">${b.totalAmount.toFixed(2)}</strong>
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
        {/* TAB 4: HOTEL PARTNER & MANAGER PORTAL */}
        {/* ========================================================================= */}
        {activeTab === 'manager' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-white/10 pb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Partner Property Control Room</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Hotel Management & Deal Publisher</h2>
              <p className="text-slate-400 text-sm mt-1">
                Onboard properties, define luxury suites, seed room calendars, and monetize perishable inventory through mystery discounts.
              </p>
            </div>

            {/* Quick Property Onboarding Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hotel Onboarding Form */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  Onboard Luxury Property
                </h4>
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
                      setManagerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to onboard hotel' });
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Hotel Property Name</label>
                    <input
                      type="text"
                      value={hotelForm.name}
                      onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        value={hotelForm.city}
                        onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Zone / Neighborhood</label>
                      <input
                        type="text"
                        value={hotelForm.zoneArea}
                        onChange={(e) => setHotelForm({ ...hotelForm, zoneArea: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={hotelForm.address}
                      onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    Register Property
                  </button>
                </form>
              </div>

              {/* Deal Publisher Form */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Publish Mystery Deal
                </h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!dealPublishForm.roomTypeId) {
                      alert('Please select a valid Room Category.');
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
                      setManagerMessage({ type: 'error', text: err.response?.data?.message || 'Publishing failed.' });
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Select Room Category</label>
                    <select
                      value={dealPublishForm.roomTypeId}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, roomTypeId: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (${rt.basePrice}/nt)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Mystery Clue Title (Masked)</label>
                    <input
                      type="text"
                      value={dealPublishForm.mysteryTitle}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, mysteryTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Discount Percentage: <strong className="text-amber-400">{dealPublishForm.discountPercent}%</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="5"
                      value={dealPublishForm.discountPercent}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, discountPercent: e.target.value })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Description Clues</label>
                    <textarea
                      rows="2"
                      value={dealPublishForm.descriptionClues}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, descriptionClues: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs transition"
                  >
                    Publish Masked Deal
                  </button>
                </form>
              </div>
            </div>

            {managerMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold ${
                  managerMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {managerMessage.text}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUTHENTICATION / ACCOUNT SWITCHER */}
        {/* ========================================================================= */}
        {activeTab === 'auth' && (
          <div className="max-w-md mx-auto space-y-6 pt-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {authMode === 'login' ? 'Sign In to MysteryStay' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Seamless role switching between Customer, Hotel Manager, and Platform Admin.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 space-y-5">
              {/* Role Presets Quick-Click Buttons */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Quick Role Switcher
                </label>
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
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500 text-[11px] font-semibold text-slate-300 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginRegister} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Platform Role</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    >
                      <option value="ROLE_CUSTOMER">Traveler (Customer)</option>
                      <option value="ROLE_HOTEL_MANAGER">Hotel Manager</option>
                      <option value="ROLE_ADMIN">System Administrator</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-indigo-400 hover:underline font-medium"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>

              {authMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    authMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
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
      {/* NATIVE MODAL DIALOG: BOOKING & SECRET HOTEL REVEAL CHECKOUT */}
      {/* ========================================================================= */}
      <dialog
        ref={bookingDialogRef}
        aria-labelledby="booking-dialog-title"
        className="glass-panel text-slate-100 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10 m-auto focus:outline-none"
      >
        {selectedDealForBooking && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                  Phase 7 Booking Engine
                </span>
                <h3 id="booking-dialog-title" className="text-lg font-black text-white mt-1">
                  Reserve Mystery Stay
                </h3>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If NOT booked yet: Checkout Form */}
            {!activeBooking && (
              <form onSubmit={handleInitiateBooking} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 space-y-1">
                  <span className="text-xs text-indigo-400 font-bold">{selectedDealForBooking.mysteryTitle}</span>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedDealForBooking.zoneArea}, {selectedDealForBooking.city} ({selectedDealForBooking.starRating}★)</span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-400 pt-1">
                    ${selectedDealForBooking.mysteryPrice.toFixed(2)}
                    <span className="text-xs font-normal text-slate-400"> / night (Save {selectedDealForBooking.discountPercent}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Check-In Date</label>
                    <input
                      type="date"
                      value={bookingFormData.checkInDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Check-Out Date</label>
                    <input
                      type="date"
                      value={bookingFormData.checkOutDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Guest Full Name</label>
                    <input
                      type="text"
                      value={bookingFormData.guestName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={bookingFormData.guestPhone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, guestPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Guest Email</label>
                  <input
                    type="email"
                    value={bookingFormData.guestEmail}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pessimistic Room Lock:</strong> Submitting locks room inventory with a 15-minute hold. Double-booking is guaranteed impossible.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Acquiring Concurrency Lock...' : 'Lock Reservation (15-Min Hold)'}
                </button>
              </form>
            )}

            {/* If In PENDING_PAYMENT State: 15-Minute Countdown & Reveal Action */}
            {activeBooking && activeBooking.status === 'PENDING_PAYMENT' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                    Reservation Held • Complete Payment Before Expiry
                  </span>
                  <div className="text-3xl font-black text-amber-300 font-mono flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>
                      {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Booking Reference: <strong className="text-white font-mono">{activeBooking.bookingReference}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Stay Duration:</span>
                    <strong className="text-white">{activeBooking.stayNights} Nights</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Nightly Rate:</span>
                    <strong className="text-white">${activeBooking.nightlyRate.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-200 font-bold border-t border-white/10 pt-2 text-sm">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">${activeBooking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmReservation(activeBooking.bookingId)}
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Confirm & Reveal Secret Hotel Identity</span>
                </button>
              </div>
            )}

            {/* If CONFIRMED: Secret Identity Revealed! */}
            {activeBooking && activeBooking.status === 'CONFIRMED' && (
              <div className="space-y-5 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2 pt-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-black">
                    Booking Confirmed • Secret Revealed
                  </span>
                  <h3 className="text-2xl font-black text-white">{activeBooking.hotelName}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Exact Street Address</span>
                    <strong className="text-white flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {activeBooking.hotelAddress}
                    </strong>
                  </div>
                  {activeBooking.hotelPhone && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Direct Concierge Phone</span>
                      <strong className="text-white font-mono">{activeBooking.hotelPhone}</strong>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <strong className="text-emerald-400 font-mono">{activeBooking.bookingReference}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal();
                    setActiveTab('bookings');
                  }}
                  className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition"
                >
                  View in My Reservations
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>

      {/* Modern Big Tech Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-8 text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">MysteryStay Monolith</span>
            <span>•</span>
            <span>Java 21 • Spring Boot 3.3.5 • MySQL 8.4/9.x • Redis • React 18 • Vite • Tailwind</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              API: <strong>v1.0.0-PHASE7</strong>
            </span>
            <span>MySQL: <strong>Connected</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
