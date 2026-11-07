import React, { useState, useEffect } from 'react';
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
  checkRoomAvailability,
  fetchPublicDeals,
  createMysteryDeal,
  fetchMyDeals
} from './api/client';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  UserCheck,
  LogOut,
  Lock,
  Building,
  CheckCheck,
  MapPin,
  Star,
  BedDouble,
  Calendar,
  DollarSign,
  Tag,
  Percent,
  EyeOff
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: 'manager@grandazure.com',
    password: 'Password123!',
    fullName: 'Robert Sterling',
    role: 'ROLE_HOTEL_MANAGER'
  });
  const [authResponse, setAuthResponse] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Hotel & Amenity State
  const [amenities, setAmenities] = useState([]);
  const [myHotels, setMyHotels] = useState([]);
  const [adminHotels, setAdminHotels] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const [hotelForm, setHotelForm] = useState({
    name: 'Grand Azure Palace',
    brandChain: 'Azure Resorts',
    starRating: 5,
    address: '42 Ocean View Boulevard',
    city: 'Bangalore',
    zoneArea: 'Indiranagar',
    postalCode: '560038',
    latitude: '12.9716000',
    longitude: '77.5946000',
    phone: '+919876543210',
    email: 'reservations@grandazure.com'
  });

  // Room Types & Inventory State
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: 'Executive Balcony Suite',
    category: 'EXECUTIVE_SUITE',
    description: 'Luxury ocean view suite with king bed and private jacuzzi',
    maxAdults: 2,
    maxChildren: 1,
    basePrice: '350.00'
  });

  const [seedForm, setSeedForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalRooms: 12,
    priceOverride: ''
  });

  // Phase 5: Mystery Deals State
  const [publicDeals, setPublicDeals] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [dealForm, setDealForm] = useState({
    mysteryTitle: '5-Star Luxury Retreat in Indiranagar',
    descriptionClues: 'Tucked away in Bangalore’s premier dining and shopping district with panoramic skyline views.',
    discountPercent: 40,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });
  const [dealMessage, setDealMessage] = useState(null);
  const [dealLoading, setDealLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await checkSystemHealth();
      setHealth(res.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const loadAmenities = async () => {
    try {
      const res = await fetchAmenities();
      setAmenities(res.data || []);
    } catch {
      // Ignored
    }
  };

  const loadPublicDeals = async () => {
    try {
      const res = await fetchPublicDeals();
      setPublicDeals(res.data || []);
    } catch {
      // Ignored
    }
  };

  const loadHotels = async () => {
    if (!currentUser) return;
    setHotelLoading(true);
    try {
      if (currentUser.role === 'ROLE_ADMIN') {
        const res = await fetchAdminHotels();
        setAdminHotels(res.data.content || []);
      } else if (currentUser.role === 'ROLE_HOTEL_MANAGER') {
        const res = await fetchMyHotels();
        const list = res.data || [];
        setMyHotels(list);
        if (list.length > 0 && !selectedHotelId) {
          setSelectedHotelId(list[0].id);
        }
      }
    } catch {
      // Ignored
    } finally {
      setHotelLoading(false);
    }
  };

  const loadRoomTypes = async (hotelId) => {
    if (!hotelId) return;
    try {
      const res = await fetchRoomTypesByHotel(hotelId);
      const list = res.data || [];
      setRoomTypes(list);
      if (list.length > 0 && !selectedRoomTypeId) {
        setSelectedRoomTypeId(list[0].id);
      }
    } catch {
      setRoomTypes([]);
    }
  };

  const loadMyDeals = async () => {
    if (!currentUser || currentUser.role !== 'ROLE_HOTEL_MANAGER') return;
    try {
      const res = await fetchMyDeals();
      setMyDeals(res.data || []);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchHealth();
    loadAmenities();
    loadPublicDeals();
    const token = localStorage.getItem('mystery_access_token');
    if (token) {
      loadProfile();
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadHotels();
      loadMyDeals();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedHotelId) {
      loadRoomTypes(selectedHotelId);
    }
  }, [selectedHotelId]);

  const loadProfile = async () => {
    try {
      const res = await fetchCurrentUser();
      setCurrentUser(res.data);
    } catch {
      setCurrentUser(null);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      let res;
      if (authMode === 'register') {
        res = await registerUser(formData);
        setAuthMessage({ type: 'success', text: 'Registration successful! JWT tokens issued.' });
      } else {
        res = await loginUser({ email: formData.email, password: formData.password });
        setAuthMessage({ type: 'success', text: 'Login successful!' });
      }

      setAuthResponse(res.data);
      localStorage.setItem('mystery_access_token', res.data.accessToken);
      setCurrentUser(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed.';
      setAuthMessage({ type: 'error', text: msg });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!selectedRoomTypeId) return;
    setDealLoading(true);
    setDealMessage(null);
    try {
      const payload = {
        roomTypeId: selectedRoomTypeId,
        mysteryTitle: dealForm.mysteryTitle,
        descriptionClues: dealForm.descriptionClues,
        discountPercent: parseInt(dealForm.discountPercent, 10),
        validFrom: dealForm.validFrom,
        validTo: dealForm.validTo
      };
      await createMysteryDeal(payload);
      setDealMessage({ type: 'success', text: 'Mystery deal published successfully with masked identity!' });
      loadPublicDeals();
      loadMyDeals();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Deal creation failed.';
      setDealMessage({ type: 'error', text: msg });
    } finally {
      setDealLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(authResponse?.refreshToken);
    } catch {
      // Ignored
    }
    setAuthResponse(null);
    setCurrentUser(null);
    setMyHotels([]);
    setAdminHotels([]);
    setRoomTypes([]);
    setMyDeals([]);
    setAuthMessage({ type: 'info', text: 'Logged out successfully.' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MysteryStay
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Phase 5: Mystery Deals
                </span>
              </h1>
              <p className="text-xs text-slate-400">Intelligent Mystery Hotel Booking Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-mono">{currentUser.email}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                  {currentUser.role}
                </span>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition ml-2" title="Logout">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="inline-flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Ping Health</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Identity-Masked Deals Engine • 20% to 70% Off Luxury Hotels</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Unsold Luxury,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-400">
              Guaranteed Value
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Premium hotels monetize unsold room inventory without compromising retail price integrity. 
            Hotel brand names and street addresses are strictly masked until reservation confirmation.
          </p>
        </div>

        {/* Phase 5 Public Mystery Deals Explorer */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Live Mystery Deals (Identity Masked)</h3>
            </div>
            <button
              onClick={loadPublicDeals}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Deals
            </button>
          </div>

          {publicDeals.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
              No mystery deals active right now. Hotel partners can publish mystery deals from the management panel below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicDeals.map((deal) => (
                <div key={deal.dealId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {deal.discountPercent}% OFF
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{deal.zoneArea}, {deal.city}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-current inline mr-0.5" />
                        {deal.starRating}-Star Luxury
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2">{deal.mysteryTitle}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{deal.descriptionClues}</p>

                    {deal.amenityClues && deal.amenityClues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {deal.amenityClues.map((clue, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                            {clue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 line-through">${deal.originalPrice.toFixed(2)}/night</div>
                      <div className="text-lg font-extrabold text-emerald-400">
                        ${deal.mysteryPrice.toFixed(2)}
                        <span className="text-xs font-normal text-slate-400">/night</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1 text-[11px] bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 font-semibold">
                      <EyeOff className="w-3 h-3" />
                      <span>Masked Hotel</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phase 5 Manager Deal Publishing Panel */}
        {currentUser && (currentUser.role === 'ROLE_HOTEL_MANAGER' || currentUser.role === 'ROLE_ADMIN') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <Tag className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Publish Mystery Deal</h3>
                <p className="text-xs text-slate-400">
                  Select an unsold room category, configure a discount percentage, and publish an identity-masked deal.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Room Category</label>
                  <select
                    value={selectedRoomTypeId || ''}
                    onChange={(e) => setSelectedRoomTypeId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} (${rt.basePrice} retail)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Percent (10% - 80%)</label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    required
                    value={dealForm.discountPercent}
                    onChange={(e) => setDealForm({ ...dealForm, discountPercent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mystery Title (Anonymized)</label>
                <input
                  type="text"
                  required
                  value={dealForm.mysteryTitle}
                  onChange={(e) => setDealForm({ ...dealForm, mysteryTitle: e.target.value })}
                  placeholder="e.g. 5-Star Luxury Retreat in Indiranagar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description Clues</label>
                <textarea
                  required
                  rows={2}
                  value={dealForm.descriptionClues}
                  onChange={(e) => setDealForm({ ...dealForm, descriptionClues: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valid From</label>
                  <input
                    type="date"
                    required
                    value={dealForm.validFrom}
                    onChange={(e) => setDealForm({ ...dealForm, validFrom: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valid To</label>
                  <input
                    type="date"
                    required
                    value={dealForm.validTo}
                    onChange={(e) => setDealForm({ ...dealForm, validTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={dealLoading || !selectedRoomTypeId}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                Publish Masked Mystery Deal
              </button>

              {dealMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${dealMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                  {dealMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{dealMessage.text}</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Interactive Authentication Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Security & Authentication Testbench</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Switch roles to test permissions: CUSTOMER, HOTEL_MANAGER, or ADMIN.
              </p>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-4 py-1.5 rounded-lg font-medium transition ${authMode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-4 py-1.5 rounded-lg font-medium transition ${authMode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Register New User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ROLE_CUSTOMER">CUSTOMER (Traveler)</option>
                      <option value="ROLE_HOTEL_MANAGER">HOTEL_MANAGER (Hotel Partner)</option>
                      <option value="ROLE_ADMIN">ADMIN (Platform Ops)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{authMode === 'register' ? 'Register Account' : 'Authenticate & Issue JWT'}</span>
              </button>

              {authMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${authMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : authMessage.type === 'error' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {authMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{authMessage.text}</span>
                </div>
              )}
            </form>

            {/* Live Token & Claims Inspector */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Live Security Context
                </span>
                {currentUser && (
                  <button onClick={loadProfile} className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    GET /api/v1/auth/me
                  </button>
                )}
              </div>

              {currentUser ? (
                <div className="space-y-2">
                  <div className="text-emerald-400 font-semibold">✓ Authenticated User Principal:</div>
                  <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto text-[11px] text-slate-200 border border-slate-800">
                    {JSON.stringify(currentUser, null, 2)}
                  </pre>
                  {authResponse?.accessToken && (
                    <div>
                      <div className="text-slate-400 text-[11px] mt-2 mb-1">Access Token (Bearer JWT):</div>
                      <div className="bg-slate-900 p-2.5 rounded-lg text-[10px] break-all text-indigo-300 border border-slate-800 max-h-20 overflow-y-auto">
                        {authResponse.accessToken}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 py-8 text-center">
                  No active session. Sign in as HOTEL_MANAGER to publish masked mystery deals.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        MysteryStay Engineering Monolith • Designed with Java 21, Spring Boot 3, and React.
      </footer>
    </div>
  );
}
