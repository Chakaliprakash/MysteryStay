import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Filter,
  CheckCircle,
  Plus,
  Sliders,
  DollarSign,
  Shield,
  Layers,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import {
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
  fetchPublicDeals,
  createMysteryDeal,
  searchMysteryDeals,
  fetchBestStayWindow,
  createBooking,
  fetchMyBookings,
  confirmBooking,
  cancelBooking
} from './api/client';

// Curated high-resolution real-world luxury hotel photography
const HOTEL_IMAGES = {
  1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', // Royal Palace Bangalore
  2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80', // Waterfront Mumbai
  3: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80', // Beachfront Villa Goa
  4: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', // Heritage Sanctuary Delhi
  default: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80'
};

const CATEGORIES = [
  { id: 'all', label: 'All Stays', icon: '🌟' },
  { id: 'beach', label: 'Beachfront Villas', icon: '🏖️' },
  { id: 'palace', label: 'Heritage & Palaces', icon: '🏰' },
  { id: 'city', label: 'Executive City Suites', icon: '🌆' },
  { id: 'luxury5', label: '5-Star Luxury Only', icon: '💎' },
  { id: 'deep-discount', label: 'Super Deals (≥45%)', icon: '🏷️' }
];

export default function App() {
  // Navigation & Role states
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'deals' | 'dsa' | 'trips' | 'partner' | 'admin' | 'auth'
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('VALUE_SCORE'); // 'VALUE_SCORE' | 'PRICE_ASC' | 'DISCOUNT_DESC' | 'RATING_DESC'

  // User & Auth state
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
    guestPhone: '+91 98765 43210',
    specialRequests: 'Quiet room with skyline or pool view'
  });
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900);

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
    phone: '+91 80 2345 6789',
    email: 'reservations@grandazure.com',
    selectedAmenities: [1, 2, 3, 6]
  });
  const [dealPublishForm, setDealPublishForm] = useState({
    roomTypeId: '',
    mysteryTitle: '5-Star Waterfront Splendor in Bandra',
    descriptionClues: 'Panoramic oceanfront vistas with private infinity plunge pool and Michelin-recognized dining.',
    discountPercent: 40,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [managerMessage, setManagerMessage] = useState(null);

  // Admin portal state
  const [adminHotels, setAdminHotels] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminActionMessage, setAdminActionMessage] = useState(null);

  const bookingDialogRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Initial Load
  useEffect(() => {
    loadDeals();
    checkCurrentUser();

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 15-Minute Countdown Timer
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
        setBookingFormData((prev) => ({
          ...prev,
          guestName: res.data.fullName || 'Alex Morgan',
          guestEmail: res.data.email
        }));
      }
    } catch {
      // Guest mode
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

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const res = await fetchAdminHotels();
      setAdminHotels(res.data || []);
    } catch {
      // Ignored
    } finally {
      setAdminLoading(false);
    }
  };

  // 1-Click Role Switcher
  const handleQuickSwitchRole = async (targetRole) => {
    let credentials = { email: 'customer@mysterystay.com', password: 'Password123!', name: 'Alex Morgan' };
    let targetTabName = 'deals';

    if (targetRole === 'ROLE_HOTEL_MANAGER') {
      credentials = { email: 'manager@grandazure.com', password: 'Password123!', name: 'Robert Sterling' };
      targetTabName = 'partner';
    } else if (targetRole === 'ROLE_ADMIN') {
      credentials = { email: 'admin@mysterystay.com', password: 'Password123!', name: 'Victoria Vance' };
      targetTabName = 'admin';
    }

    setAuthLoading(true);
    try {
      const res = await loginUser({ email: credentials.email, password: credentials.password });
      localStorage.setItem('mystery_access_token', res.data.accessToken);
      localStorage.setItem('mystery_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      setActiveTab(targetTabName);

      if (targetRole === 'ROLE_HOTEL_MANAGER') {
        loadPartnerData();
      } else if (targetRole === 'ROLE_ADMIN') {
        loadAdminData();
      } else {
        loadUserBookings();
      }
    } catch (err) {
      alert(`Could not sign in as ${targetRole}. Please check server.`);
    } finally {
      setAuthLoading(false);
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
      setAuthMessage({ type: 'success', text: `Welcome back, ${loginRes.data.user.fullName}` });

      if (loginRes.data.user.role === 'ROLE_ADMIN') {
        setActiveTab('admin');
        loadAdminData();
      } else if (loginRes.data.user.role === 'ROLE_HOTEL_MANAGER') {
        setActiveTab('partner');
        loadPartnerData();
      } else {
        setActiveTab('deals');
        loadUserBookings();
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
    setActiveTab('explore');
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
      setActiveTab('dsa');
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
      setActiveTab('dsa');
    } catch {
      // Ignored
    } finally {
      setStayWindowLoading(false);
    }
  };

  // Booking Modal
  const openBookingModal = (deal) => {
    setSelectedDealForBooking(deal);
    setActiveBooking(null);
    setCountdownSeconds(900);
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
      loadUserBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Confirmation failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this reservation? Held rooms are restored to the inventory ledger.')) return;
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

  // Toggle Hotel Verification (Admin)
  const handleToggleHotelVerification = async (hotelId, currentStatus) => {
    try {
      await verifyHotelAdmin(hotelId, !currentStatus);
      setAdminActionMessage({
        type: 'success',
        text: `Hotel ID #${hotelId} is now ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}.`
      });
      loadAdminData();
      loadDeals();
    } catch (err) {
      setAdminActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update verification status.'
      });
    }
  };

  // Filtered & Sorted Deals
  const filteredDeals = deals.filter((deal) => {
    const matchesCity = selectedCity === 'All' || deal.city.toLowerCase() === selectedCity.toLowerCase();
    let matchesCategory = true;
    if (selectedCategory === 'beach') {
      matchesCategory = deal.roomCategory === 'VILLA' || deal.city.toLowerCase() === 'goa';
    } else if (selectedCategory === 'palace') {
      matchesCategory = deal.mysteryTitle.toLowerCase().includes('palace') || deal.mysteryTitle.toLowerCase().includes('heritage');
    } else if (selectedCategory === 'city') {
      matchesCategory = deal.city.toLowerCase() === 'mumbai' || deal.city.toLowerCase() === 'delhi' || deal.city.toLowerCase() === 'bangalore';
    } else if (selectedCategory === 'luxury5') {
      matchesCategory = deal.starRating >= 5;
    } else if (selectedCategory === 'deep-discount') {
      matchesCategory = deal.discountPercent >= 45;
    }
    return matchesCity && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'PRICE_ASC') return a.mysteryPrice - b.mysteryPrice;
    if (sortBy === 'DISCOUNT_DESC') return b.discountPercent - a.discountPercent;
    if (sortBy === 'RATING_DESC') return b.starRating - a.starRating;
    return a.dealId - b.dealId; // Default
  });

  const citySuggestions = ['Bangalore', 'Mumbai', 'Goa', 'Delhi'];
  const clueSuggestions = ['Rooftop Infinity Pool', 'Luxury Wellness Spa', 'Private Beachfront Villa', 'Fine Dining Restaurant'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#4F46E5] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT & ROLE SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#0F172A] text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Live Prototype</span>
            <span className="text-slate-500">•</span>
            <span>MySQL 9.x Connected</span>
            <span className="text-slate-500">•</span>
            <span>Rate-Parity Identity Masking</span>
          </div>

          {/* 1-Click Role Switcher Presets */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-400 font-medium">Test Role:</span>
            <button
              onClick={() => handleQuickSwitchRole('ROLE_CUSTOMER')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition ${
                currentUser?.role === 'ROLE_CUSTOMER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Traveler
            </button>
            <button
              onClick={() => handleQuickSwitchRole('ROLE_HOTEL_MANAGER')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition ${
                currentUser?.role === 'ROLE_HOTEL_MANAGER'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Hotel Partner
            </button>
            <button
              onClick={() => handleQuickSwitchRole('ROLE_ADMIN')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition ${
                currentUser?.role === 'ROLE_ADMIN'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Platform Admin
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-WORLD MAIN NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('explore')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Mystery<span className="text-indigo-600">Stay</span></span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  Luxe
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">5-Star Unsold Inventory Network</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'explore' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explore Deals
            </button>
            <button
              onClick={() => setActiveTab('dsa')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'dsa' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>DSA Intelligence</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('trips');
                if (currentUser) loadUserBookings();
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'trips' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              My Trips
            </button>

            {/* Role-Specific Navigation Buttons */}
            {(currentUser?.role === 'ROLE_HOTEL_MANAGER' || currentUser?.role === 'ROLE_ADMIN') && (
              <button
                onClick={() => {
                  setActiveTab('partner');
                  loadPartnerData();
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'partner' ? 'text-emerald-700 bg-emerald-50' : 'text-emerald-600 hover:bg-emerald-50/50'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Partner Studio</span>
              </button>
            )}

            {currentUser?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  loadAdminData();
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'text-amber-800 bg-amber-50' : 'text-amber-700 hover:bg-amber-50/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                  <div className="text-[10px] font-mono font-medium text-slate-500">
                    {currentUser.role.replace('ROLE_', '')}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                  {currentUser.fullName?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-600/20 active:scale-95"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO BILLBOARD & LIVE SPOTLIGHT SEARCH (FRESH & LIGHT) */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <section className="relative bg-slate-900 text-white overflow-hidden">
          {/* High-Resolution Luxury Hotel Resort Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80')`
            }}
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Up to 70% Off Perishable 5-Star Hotel Inventory</span>
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Unlock Confidential <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">Luxury Stays</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Top luxury hotels monetize unsold suites with zero brand damage.
              Property identity stays masked until your reservation is locked.
            </p>

            {/* REAL-WORLD FLOATING SPOTLIGHT SEARCH BAR */}
            <div ref={searchContainerRef} className="max-w-3xl mx-auto pt-4 relative">
              <div className="bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-200/80 flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 flex items-center px-3 py-2 w-full">
                  <MapPin className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0" />
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
                    placeholder="Where to? (e.g. Bangalore, Mumbai, Beachfront, Infinity Pool...)"
                    className="w-full text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="hidden md:block h-8 w-[1px] bg-slate-200" />

                <div className="flex items-center space-x-2 w-full md:w-auto px-2">
                  <button
                    onClick={() => handleRunSearch()}
                    className="w-full md:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Deals</span>
                  </button>
                </div>
              </div>

              {/* Autocomplete & Recommendations Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-20 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 text-left space-y-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                      Popular Luxury Destinations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {citySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSearchQuery(city);
                            setSelectedCity(city);
                            handleRunSearch(city);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{city}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                      Trending Luxury Clues (Inverted Index)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {clueSuggestions.map((clue) => (
                        <button
                          key={clue}
                          type="button"
                          onClick={() => {
                            setSearchQuery(clue);
                            setSearchFilters((prev) => ({ ...prev, amenities: [clue] }));
                            handleRunSearch();
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition flex items-center gap-1.5 border border-amber-200"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{clue}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Matching Drops */}
                  {searchQuery.trim().length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                        Instant Deal Matches
                      </span>
                      <div className="space-y-1.5">
                        {deals
                          .filter(
                            (d) =>
                              d.mysteryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.zoneArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (d.amenityClues && d.amenityClues.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())))
                          )
                          .slice(0, 3)
                          .map((matched) => (
                            <div
                              key={matched.dealId}
                              onClick={() => {
                                setShowSearchDropdown(false);
                                openBookingModal(matched);
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition border border-transparent hover:border-slate-200"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-900">{matched.mysteryTitle}</div>
                                <div className="text-[11px] text-slate-500">{matched.zoneArea}, {matched.city} • {matched.roomCategory}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-emerald-600 font-mono">${matched.mysteryPrice.toFixed(2)}</div>
                                <div className="text-[10px] font-bold text-indigo-600">{matched.discountPercent}% OFF</div>
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
      )}

      {/* ========================================================================= */}
      {/* 4. REAL-WORLD CATEGORY BAR & FILTERS */}
      {/* ========================================================================= */}
      {(activeTab === 'explore' || activeTab === 'deals') && (
        <section className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* City & Sort Controls */}
              <div className="flex items-center space-x-3 text-xs">
                {/* City Filter */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'Bangalore', 'Mumbai', 'Goa', 'Delhi'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        selectedCity === city
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-100 border-none rounded-xl px-3 py-1.5 font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="VALUE_SCORE">Top Value Score (DSA)</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="DISCOUNT_DESC">Highest Discount %</option>
                  <option value="RATING_DESC">Star Rating</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN CONTENT VIEWPORT */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* ========================================================================= */}
        {/* VIEW 1: EXPLORE / CURATED DEALS (REAL WORLD LUXURY CARDS) */}
        {/* ========================================================================= */}
        {(activeTab === 'explore' || activeTab === 'deals') && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Verified Mystery Hotel Deals
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Showing {filteredDeals.length} confidential properties with protected rate-parity discounts.
                </p>
              </div>
              <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hotel name & street address unlocked after payment</span>
              </div>
            </div>

            {/* REAL-WORLD LUXURY DEAL CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => {
                const imageUrl = HOTEL_IMAGES[deal.dealId] || HOTEL_IMAGES.default;
                return (
                  <div
                    key={deal.dealId}
                    className="luxury-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Real-World Hotel Photo with Overlays */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={deal.mysteryTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Gradient overlay on image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Secret Identity</span>
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-md">
                          {deal.discountPercent}% OFF
                        </span>
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {deal.zoneArea}, {deal.city}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {deal.starRating}.0 Luxury
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                          {deal.roomCategory.replace('_', ' ')}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {deal.mysteryTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {deal.descriptionClues}
                        </p>

                        {/* Amenity Clues Pills */}
                        {deal.amenityClues && deal.amenityClues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {deal.amenityClues.slice(0, 3).map((clue, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {clue}
                              </span>
                            ))}
                            {deal.amenityClues.length > 3 && (
                              <span className="text-[10px] font-semibold text-slate-400 self-center">
                                +{deal.amenityClues.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Reservation CTA */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 line-through block font-mono">
                            ${deal.originalPrice.toFixed(2)} retail
                          </span>
                          <div className="text-xl font-extrabold text-emerald-600 font-mono">
                            ${deal.mysteryPrice.toFixed(2)}
                            <span className="text-xs text-slate-500 font-normal"> / night</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCalculateBestWindow(deal.dealId, 3)}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                            title="Calculate 3-night cheapest stay window (Sliding Window Algorithm)"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openBookingModal(deal)}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Reserve</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DSA INTELLIGENCE ENGINE (ALGORITHMIC PLAYGROUND) */}
        {/* ========================================================================= */}
        {activeTab === 'dsa' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold uppercase text-amber-600 tracking-wider block mb-1">
                Data Structures & Algorithms in Action
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Algorithmic Search & Price Optimization Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Demonstrates how MysteryStay integrates advanced algorithmic solutions into business logic:
                Bounded Min-Heap Top-K ranker, Multi-attribute Inverted Index, and Sliding Window rate optimizer.
              </p>
            </div>

            {/* Filter & Benchmark Controls */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Destination City</label>
                  <input
                    type="text"
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    placeholder="e.g. Bangalore, Mumbai, Goa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Star Tier</label>
                  <select
                    value={searchFilters.minRating}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Any Star Rating</option>
                    <option value="4">4★ & Above</option>
                    <option value="5">5★ Luxury Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Top-K Heap Sizing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSearchFilters({ ...searchFilters, k })}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          searchFilters.k === k
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Top {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenity Chips for Inverted Index */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Multi-Attribute Inverted Index Clues (Set Intersection)
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
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleRunSearch()}
                  disabled={searchLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  <Zap className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
                  <span>{searchLoading ? 'Ranking...' : 'Execute Min-Heap Ranker'}</span>
                </button>
              </div>
            </div>

            {/* Performance Telemetry Card */}
            {searchResult && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Algorithm Architecture</span>
                    <strong className="text-white text-sm">{searchResult.algorithmUsed}</strong>
                  </div>
                </div>
                <div className="flex items-center space-x-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Candidates Evaluated</span>
                    <strong className="text-white text-sm">{searchResult.totalCandidatesEvaluated}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Heap Returned</span>
                    <strong className="text-emerald-400 text-sm">{searchResult.returnedCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Execution Latency</span>
                    <strong className="text-amber-400 text-sm">{searchResult.executionTimeMicros} µs</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Sliding Window Optimization Result */}
            {activeStayWindow && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    <span>Sliding Window: Optimal {activeStayWindow.stayLength}-Night Stay Window Identified</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                    {activeStayWindow.algorithmUsed} ({activeStayWindow.executionTimeMicros} µs)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Optimal Check-In</span>
                    <strong className="text-slate-900 font-mono text-sm">{activeStayWindow.bestCheckInDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Optimal Check-Out</span>
                    <strong className="text-slate-900 font-mono text-sm">{activeStayWindow.bestCheckOutDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Stay Cost</span>
                    <strong className="text-emerald-700 text-base font-mono font-extrabold">${activeStayWindow.totalCost.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Savings vs Peak Window</span>
                    <strong className="text-amber-700 text-base font-mono font-extrabold">+${activeStayWindow.savingsVsWorstWindow.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Ranked Results Grid */}
            {searchResult && searchResult.deals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResult.deals.map((item, idx) => (
                  <div key={item.deal.dealId} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md">
                        Rank #{idx + 1} • ValueScore: {item.valueScore.toFixed(2)}
                      </span>
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md">
                        {item.deal.discountPercent}% OFF
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{item.deal.mysteryTitle}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.deal.descriptionClues}</p>
                    <div className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {item.explanation}
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-lg font-bold text-emerald-600 font-mono">
                        ${item.deal.mysteryPrice.toFixed(2)}/nt
                      </div>
                      <button
                        onClick={() => openBookingModal(item.deal)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                      >
                        Reserve Deal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: MY TRIPS & SECRET IDENTITY UNLOCK (STATE MACHINE) */}
        {/* ========================================================================= */}
        {activeTab === 'trips' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Reservations</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Track your confidential hotel reservations, pessimistic hold timers, and unlocked identity certificates.
                </p>
              </div>
              {currentUser && (
                <button
                  onClick={loadUserBookings}
                  disabled={bookingsLoading}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Trips</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-md mx-auto">
                <User className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Sign In to View Trips</h3>
                <p className="text-xs text-slate-500">
                  Access your active holds, payment confirmations, and secret property reveal certificates.
                </p>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Sign In Now
                </button>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No active bookings yet</h3>
                <p className="text-xs text-slate-500">Browse mystery deals and lock in your next luxury getaway.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
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
                      className={`bg-white rounded-2xl p-6 border transition-all ${
                        isConfirmed
                          ? 'border-emerald-300 shadow-md ring-1 ring-emerald-200'
                          : 'border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-xs mb-1">
                            <span className="font-mono text-indigo-600 font-bold">{b.bookingReference}</span>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {b.status.replace('_', ' ')}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {isConfirmed ? (
                              <>
                                <Unlock className="w-5 h-5 text-emerald-600" />
                                <span>{b.hotelName}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 text-amber-600" />
                                <span>Confidential 5-Star Hotel ({b.zoneArea}, {b.city})</span>
                              </>
                            )}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isPending && (
                            <button
                              onClick={() => handleConfirmReservation(b.bookingId)}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Complete Payment</span>
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && (
                            <button
                              onClick={() => handleCancelBooking(b.bookingId)}
                              className="px-4 py-2.5 rounded-xl bg-slate-100 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* UNLOCKED SECRET HOTEL CREDENTIALS (CONFIRMED) */}
                      {isConfirmed && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block mb-0.5">
                              ✨ Secret Identity Revealed
                            </span>
                            <div className="text-slate-900 font-bold flex items-center gap-1.5 text-sm">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              <span>{b.hotelAddress}</span>
                            </div>
                          </div>
                          {b.hotelPhone && (
                            <div className="text-slate-600 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                              Concierge: <strong className="text-slate-900">{b.hotelPhone}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Stay Dates</span>
                          <strong className="text-slate-800 font-mono">{b.checkInDate} → {b.checkOutDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Suite Category</span>
                          <strong className="text-slate-800">{b.roomTypeName} ({b.stayNights} Nights)</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Guest Name</span>
                          <strong className="text-slate-800">{b.guestName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Paid</span>
                          <strong className="text-emerald-600 font-mono font-extrabold text-sm">${b.totalAmount.toFixed(2)}</strong>
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
        {/* VIEW 4: HOTEL PARTNER STUDIO (ROLE: HOTEL_MANAGER) */}
        {/* ========================================================================= */}
        {activeTab === 'partner' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider block mb-1">
                Hotelier Operations & Revenue Management
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Partner Studio Control Room</h2>
              <p className="text-xs text-slate-500 mt-1">
                Monetize distressed, unsold perishable rooms at high margins with zero public rate cannibalization.
              </p>
            </div>

            {/* Partner KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-bold block mb-1">Onboarded Properties</span>
                <span className="text-2xl font-extrabold text-slate-900">{myHotels.length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-bold block mb-1">Perishable Room Fill</span>
                <span className="text-2xl font-extrabold text-emerald-600">+38% Lift</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-bold block mb-1">Rate Parity Health</span>
                <span className="text-2xl font-extrabold text-indigo-600">100% Protected</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-bold block mb-1">Direct Settlement</span>
                <span className="text-2xl font-extrabold text-amber-600">T+1 Daily</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hotel Property Registration */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <span>Register Luxury Property</span>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Name</label>
                    <input
                      type="text"
                      value={hotelForm.name}
                      onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={hotelForm.city}
                        onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Zone / Neighborhood</label>
                      <input
                        type="text"
                        value={hotelForm.zoneArea}
                        onChange={(e) => setHotelForm({ ...hotelForm, zoneArea: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={hotelForm.address}
                      onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    Register Hotel Partner
                  </button>
                </form>
              </div>

              {/* Mystery Deal Publisher */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-500" />
                  <span>Publish Mystery Deal</span>
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!dealPublishForm.roomTypeId) {
                      alert('Please select a suite.');
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
                      setManagerMessage({ type: 'success', text: 'Mystery deal published with identity masking enabled!' });
                      loadDeals();
                    } catch (err) {
                      setManagerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to publish deal' });
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Room Category</label>
                    <select
                      value={dealPublishForm.roomTypeId}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, roomTypeId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    >
                      <option value="">Select Suite</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (${rt.basePrice}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clue Title (Masked USP)</label>
                    <input
                      type="text"
                      value={dealPublishForm.mysteryTitle}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, mysteryTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Distressed Discount: <strong className="text-rose-600">{dealPublishForm.discountPercent}% OFF</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="5"
                      value={dealPublishForm.discountPercent}
                      onChange={(e) => setDealPublishForm({ ...dealPublishForm, discountPercent: e.target.value })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    Publish Distressed Inventory Deal
                  </button>
                </form>
              </div>
            </div>

            {managerMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  managerMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {managerMessage.text}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: PLATFORM ADMIN GOVERNANCE (ROLE: ADMIN) */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold uppercase text-amber-600 tracking-wider block mb-1">
                Platform Administration & Governance
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Operations Console</h2>
              <p className="text-xs text-slate-500 mt-1">
                Audit partner hotels, toggle verification status, and monitor system-wide inventory distribution.
              </p>
            </div>

            {adminActionMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  adminActionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {adminActionMessage.text}
              </div>
            )}

            {/* Admin Hotel Management Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Partner Hotel Verification Ledger</h3>
                <button
                  onClick={loadAdminData}
                  disabled={adminLoading}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Property Name</th>
                      <th className="px-5 py-3.5">City & Zone</th>
                      <th className="px-5 py-3.5">Star Tier</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminHotels.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-400">#{hotel.id}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{hotel.name}</td>
                        <td className="px-5 py-4 text-slate-500">{hotel.city} • {hotel.zoneArea}</td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-amber-600">{hotel.starRating}★ Luxury</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              hotel.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {hotel.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleToggleHotelVerification(hotel.id, hotel.verified)}
                            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition ${
                              hotel.verified
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            {hotel.verified ? 'Suspend Hotel' : 'Verify & Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: AUTHENTICATION / ACCOUNT SWITCHER */}
        {/* ========================================================================= */}
        {activeTab === 'auth' && (
          <div className="max-w-md mx-auto space-y-6 pt-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {authMode === 'login' ? 'Sign In to MysteryStay' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500">
                Seamless switching between Customer, Hotelier, and Administrator accounts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg space-y-5">
              <form onSubmit={handleLoginRegister} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {authLoading ? 'Signing In...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>

              {authMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    authMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
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
      {/* 6. NATIVE MODAL DIALOG CHECKOUT & IDENTITY REVEAL */}
      {/* ========================================================================= */}
      <dialog
        ref={bookingDialogRef}
        aria-labelledby="booking-title"
        className="bg-white text-slate-900 rounded-3xl p-7 max-w-lg w-full border border-slate-200 shadow-2xl m-auto focus:outline-none"
      >
        {selectedDealForBooking && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold block">
                  Confidential Reservation
                </span>
                <h3 id="booking-title" className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedDealForBooking.mysteryTitle}
                </h3>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STAGE 1: CHECKOUT FORM */}
            {!activeBooking && (
              <form onSubmit={handleInitiateBooking} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 text-xs space-y-1.5 border border-slate-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Location Clue:</span>
                    <strong className="text-slate-900">{selectedDealForBooking.zoneArea}, {selectedDealForBooking.city}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Mystery Price:</span>
                    <strong className="text-emerald-600 font-mono text-sm">${selectedDealForBooking.mysteryPrice.toFixed(2)}/night</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Check-In</label>
                    <input
                      type="date"
                      value={bookingFormData.checkInDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Check-Out</label>
                    <input
                      type="date"
                      value={bookingFormData.checkOutDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    value={bookingFormData.guestName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Pessimistic row locking reserves rooms for 15 minutes.</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {bookingSubmitting ? 'Acquiring Pessimistic Lock...' : 'Lock Reservation (15-Min Hold)'}
                </button>
              </form>
            )}

            {/* STAGE 2: 15-MINUTE COUNTDOWN HOLD */}
            {activeBooking && activeBooking.status === 'PENDING_PAYMENT' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-800 block font-bold">
                    Reservation Hold Active
                  </span>
                  <div className="text-3xl font-extrabold text-amber-600 font-mono flex items-center justify-center gap-2">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span>
                      {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    Reference: {activeBooking.bookingReference}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 text-xs space-y-1 border border-slate-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Amount:</span>
                    <strong className="text-emerald-600 font-mono text-sm">${activeBooking.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Duration:</span>
                    <strong className="text-slate-800">{activeBooking.stayNights} Nights</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmReservation(activeBooking.bookingId)}
                  disabled={bookingSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Confirm Payment & Reveal Secret Hotel Identity</span>
                </button>
              </div>
            )}

            {/* STAGE 3: UNLOCKED SECRET HOTEL CREDENTIALS! */}
            {activeBooking && activeBooking.status === 'CONFIRMED' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold tracking-wider block">
                    Confirmed • Secret Revealed
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900">{activeBooking.hotelName}</h3>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Street Address</span>
                    <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {activeBooking.hotelAddress}
                    </strong>
                  </div>
                  {activeBooking.hotelPhone && (
                    <div>
                      <span className="text-[10px] text-slate-500 block">Direct Concierge Telephone</span>
                      <strong className="text-slate-900 font-mono">{activeBooking.hotelPhone}</strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    closeBookingModal();
                    setActiveTab('trips');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
                >
                  View in My Trips
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>

      {/* ========================================================================= */}
      {/* 7. REAL-WORLD PRODUCTION FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>MysteryStay</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                The intelligent mystery hotel booking platform helping luxury properties monetize perishable room inventory while protecting brand rate parity.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Popular Cities</h4>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => { setSelectedCity('Bangalore'); setActiveTab('deals'); }} className="hover:text-white">Bangalore Luxury Stays</button></li>
                <li><button onClick={() => { setSelectedCity('Mumbai'); setActiveTab('deals'); }} className="hover:text-white">Mumbai Waterfront Villas</button></li>
                <li><button onClick={() => { setSelectedCity('Goa'); setActiveTab('deals'); }} className="hover:text-white">Goa Beachfront Suites</button></li>
                <li><button onClick={() => { setSelectedCity('Delhi'); setActiveTab('deals'); }} className="hover:text-white">Delhi Heritage Palaces</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Core Architecture</h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>Java 21 • Spring Boot 3.3.5</li>
                <li>MySQL 9.x • Flyway Migrations</li>
                <li>Pessimistic Concurrency Locking</li>
                <li>Bounded Min-Heap Top-K Ranker</li>
                <li>Sliding Window Rate Optimizer</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Quick Role Switch</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickSwitchRole('ROLE_CUSTOMER')}
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  👤 Traveler View
                </button>
                <button
                  onClick={() => handleQuickSwitchRole('ROLE_HOTEL_MANAGER')}
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  🏨 Hotel Partner View
                </button>
                <button
                  onClick={() => handleQuickSwitchRole('ROLE_ADMIN')}
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  🛡️ Platform Admin View
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <p>© 2026 MysteryStay Inc. All rights reserved. Identity masking protected by rate-parity algorithms.</p>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>System Status: <strong className="text-emerald-400">100% Operational</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
