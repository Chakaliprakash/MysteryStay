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
  checkRoomAvailability
} from './api/client';
import {
  Shield,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
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
  DollarSign
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
  const [hotelMessage, setHotelMessage] = useState(null);
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

  // Phase 4: Room Types & Inventory State
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

  const [availQuery, setAvailQuery] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    roomCount: 2
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [invLoading, setInvLoading] = useState(false);
  const [invMessage, setInvMessage] = useState(null);

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

  useEffect(() => {
    fetchHealth();
    loadAmenities();
    const token = localStorage.getItem('mystery_access_token');
    if (token) {
      loadProfile();
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadHotels();
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

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setHotelLoading(true);
    setHotelMessage(null);
    try {
      const payload = {
        ...hotelForm,
        starRating: parseInt(hotelForm.starRating, 10),
        latitude: parseFloat(hotelForm.latitude),
        longitude: parseFloat(hotelForm.longitude)
      };
      await createHotel(payload);
      setHotelMessage({ type: 'success', text: 'Hotel submitted! Status: Pending Platform Admin Verification.' });
      loadHotels();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Hotel creation failed.';
      setHotelMessage({ type: 'error', text: msg });
    } finally {
      setHotelLoading(false);
    }
  };

  const handleVerifyHotel = async (hotelId, verifyStatus) => {
    try {
      await verifyHotelAdmin(hotelId, verifyStatus);
      loadHotels();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleCreateRoomType = async (e) => {
    e.preventDefault();
    if (!selectedHotelId) return;
    setInvLoading(true);
    setInvMessage(null);
    try {
      const payload = {
        ...roomTypeForm,
        maxAdults: parseInt(roomTypeForm.maxAdults, 10),
        maxChildren: parseInt(roomTypeForm.maxChildren, 10),
        basePrice: parseFloat(roomTypeForm.basePrice)
      };
      await createRoomType(selectedHotelId, payload);
      setInvMessage({ type: 'success', text: 'Room type configured successfully!' });
      loadRoomTypes(selectedHotelId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create room type.';
      setInvMessage({ type: 'error', text: msg });
    } finally {
      setInvLoading(false);
    }
  };

  const handleSeedInventory = async (e) => {
    e.preventDefault();
    if (!selectedHotelId || !selectedRoomTypeId) return;
    setInvLoading(true);
    setInvMessage(null);
    try {
      const payload = {
        startDate: seedForm.startDate,
        endDate: seedForm.endDate,
        totalRooms: parseInt(seedForm.totalRooms, 10),
        priceOverride: seedForm.priceOverride ? parseFloat(seedForm.priceOverride) : null
      };
      const res = await seedRoomInventory(selectedHotelId, selectedRoomTypeId, payload);
      setInvMessage({ type: 'success', text: `Successfully seeded ${res.data.length} calendar days!` });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to seed inventory.';
      setInvMessage({ type: 'error', text: msg });
    } finally {
      setInvLoading(false);
    }
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!selectedRoomTypeId) return;
    try {
      const res = await checkRoomAvailability(
        selectedRoomTypeId,
        availQuery.checkInDate,
        availQuery.checkOutDate,
        availQuery.roomCount
      );
      setAvailabilityResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Availability check failed');
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
    setAvailabilityResult(null);
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
                  Phase 4: Inventory Engine
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
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 transition ml-2"
                  title="Logout"
                >
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
            <Shield className="w-3.5 h-3.5" />
            <span>Phase 4 • Room Inventory Engine & Pessimistic Row Locking</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Unsold Luxury,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-400">
              Guaranteed Value
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Helping 4 & 5-star hotels monetize unsold room inventory without compromising retail rate integrity. 
            Hotel identities remain strictly masked from customers until booking confirmation.
          </p>
        </div>

        {/* Phase 4 Room Inventory Management Panel */}
        {currentUser && (currentUser.role === 'ROLE_HOTEL_MANAGER' || currentUser.role === 'ROLE_ADMIN') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <BedDouble className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Room Inventory & Calendar Engine</h3>
                  <p className="text-xs text-slate-400">
                    Define room categories, seed daily capacity calendars, and verify date-range availability.
                  </p>
                </div>
              </div>
            </div>

            {/* Select Hotel Dropdown */}
            {myHotels.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Active Property:</span>
                <select
                  value={selectedHotelId || ''}
                  onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  {myHotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city}) {h.verified ? '✓ Verified' : '⚠️ Pending'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form 1: Create Room Type */}
              <form onSubmit={handleCreateRoomType} className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-indigo-400" />
                  Add Room Category
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type Name</label>
                  <input
                    type="text"
                    required
                    value={roomTypeForm.name}
                    onChange={(e) => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={roomTypeForm.category}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="DELUXE">Deluxe</option>
                      <option value="EXECUTIVE_SUITE">Executive Suite</option>
                      <option value="PRESIDENTIAL_SUITE">Presidential Suite</option>
                      <option value="VILLA">Private Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={roomTypeForm.basePrice}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, basePrice: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={invLoading || !selectedHotelId}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-50"
                >
                  Save Room Category
                </button>
              </form>

              {/* Form 2: Seed Calendar */}
              <form onSubmit={handleSeedInventory} className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Seed Daily Inventory Calendar
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Room Category</label>
                  <select
                    value={selectedRoomTypeId || ''}
                    onChange={(e) => setSelectedRoomTypeId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {roomTypes.length === 0 ? (
                      <option value="">No categories defined yet</option>
                    ) : (
                      roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (${rt.basePrice}/night)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={seedForm.startDate}
                      onChange={(e) => setSeedForm({ ...seedForm, startDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={seedForm.endDate}
                      onChange={(e) => setSeedForm({ ...seedForm, endDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Rooms / Day</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={seedForm.totalRooms}
                      onChange={(e) => setSeedForm({ ...seedForm, totalRooms: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Price Override ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={seedForm.priceOverride}
                      onChange={(e) => setSeedForm({ ...seedForm, priceOverride: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={invLoading || !selectedRoomTypeId}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition disabled:opacity-50"
                >
                  Generate Daily Inventory
                </button>
              </form>
            </div>

            {invMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${invMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                {invMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{invMessage.text}</span>
              </div>
            )}

            {/* Test Multi-day Availability Inspector */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Live Date-Range Availability & Pricing Simulator
              </h4>
              <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    value={availQuery.checkInDate}
                    onChange={(e) => setAvailQuery({ ...availQuery, checkInDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Check-out</label>
                  <input
                    type="date"
                    required
                    value={availQuery.checkOutDate}
                    onChange={(e) => setAvailQuery({ ...availQuery, checkOutDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rooms Needed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={availQuery.roomCount}
                    onChange={(e) => setAvailQuery({ ...availQuery, roomCount: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!selectedRoomTypeId}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-600 transition"
                  >
                    Query Availability
                  </button>
                </div>
              </form>

              {availabilityResult && (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Status:</span>
                    {availabilityResult.available ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        AVAILABLE ({availabilityResult.minAvailableRooms} rooms available across all nights)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        INSUFFICIENT ROOMS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Duration:</span>
                    <span>{availabilityResult.totalNights} nights</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Total Calculated Cost:</span>
                    <span className="text-amber-400 font-bold">${availabilityResult.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 Hotel Management Panel */}
        {currentUser && (currentUser.role === 'ROLE_HOTEL_MANAGER' || currentUser.role === 'ROLE_ADMIN') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Building className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentUser.role === 'ROLE_ADMIN' ? 'Platform Admin: Hotel Verification Portal' : 'Hotel Partner: Property Onboarding & Management'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentUser.role === 'ROLE_ADMIN'
                      ? 'Review registered hotels across cities and approve verification for inventory publishing.'
                      : 'Onboard your 4/5-star property. Unverified properties cannot publish mystery inventory.'}
                  </p>
                </div>
              </div>
              <button
                onClick={loadHotels}
                disabled={hotelLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center space-x-1.5 border border-slate-700 text-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${hotelLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Hotels</span>
              </button>
            </div>

            {/* If Hotel Manager: Show Onboarding Form + My Hotels */}
            {currentUser.role === 'ROLE_HOTEL_MANAGER' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleCreateHotel} className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-200">Onboard New Property</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Hotel Name</label>
                      <input
                        type="text"
                        required
                        value={hotelForm.name}
                        onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Chain</label>
                      <input
                        type="text"
                        value={hotelForm.brandChain}
                        onChange={(e) => setHotelForm({ ...hotelForm, brandChain: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Star Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        required
                        value={hotelForm.starRating}
                        onChange={(e) => setHotelForm({ ...hotelForm, starRating: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={hotelForm.city}
                        onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Zone / Area</label>
                      <input
                        type="text"
                        required
                        value={hotelForm.zoneArea}
                        onChange={(e) => setHotelForm({ ...hotelForm, zoneArea: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.address}
                      onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={hotelLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-500/25"
                  >
                    Submit Property for Verification
                  </button>

                  {hotelMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${hotelMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                      {hotelMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      <span>{hotelMessage.text}</span>
                    </div>
                  )}
                </form>

                {/* My Properties List */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">My Managed Properties</h4>
                  {myHotels.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                      No properties onboarded yet. Fill out the form to register your first hotel.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myHotels.map((h) => (
                        <div key={h.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-sm text-white">{h.name}</span>
                              <span className="flex items-center text-amber-400 text-xs">
                                <Star className="w-3 h-3 fill-current inline mr-0.5" />
                                {h.starRating}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{h.zoneArea}, {h.city}</span>
                            </div>
                          </div>
                          <div>
                            {h.verified ? (
                              <span className="inline-flex items-center space-x-1 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Pending Admin</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If Admin: Show All Platform Hotels with Verify Toggle */}
            {currentUser.role === 'ROLE_ADMIN' && (
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-3">All Platform Hotels</h4>
                {adminHotels.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                    No hotels registered across platform yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminHotels.map((h) => (
                      <div key={h.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-white">{h.name}</span>
                            <span className="text-xs text-slate-400">({h.brandChain || 'Independent'})</span>
                            <span className="flex items-center text-amber-400 text-xs">
                              <Star className="w-3 h-3 fill-current inline mr-0.5" />
                              {h.starRating}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{h.zoneArea}, {h.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {h.verified ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                              Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyHotel(h.id, true)}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-lg transition"
                            >
                              Approve & Verify
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                  No active session. Sign in as HOTEL_MANAGER or ADMIN to test inventory calendar seeding and capacity checks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenity Catalog Clues */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-2">Public Amenity & Clue Catalog</h3>
          <p className="text-xs text-slate-400 mb-6">
            Standardized luxury amenities used as anonymous clues without revealing hotel identity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {amenities.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{a.name}</div>
                  <div className="text-[10px] text-slate-500">{a.mysteryClue ? 'Public Mystery Clue' : 'Standard'}</div>
                </div>
              </div>
            ))}
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
