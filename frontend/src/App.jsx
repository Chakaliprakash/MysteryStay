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
  verifyHotelAdmin
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
  Star
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

  // Phase 3 Hotel & Amenity State
  const [amenities, setAmenities] = useState([]);
  const [myHotels, setMyHotels] = useState([]);
  const [adminHotels, setAdminHotels] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelMessage, setHotelMessage] = useState(null);

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
        setMyHotels(res.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setHotelLoading(false);
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
                  Phase 3: Hotel Management
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
            <span>Phase 3 • Hotel Onboarding & Admin Verification</span>
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
                  No active session. Sign in as HOTEL_MANAGER or ADMIN to test property onboarding and verification.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenity Catalog Clues */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-2">Public Amenity & Clue Catalog (Phase 3 Flyway Seed)</h3>
          <p className="text-xs text-slate-400 mb-6">
            These standardized amenities will serve as anonymous clues in Phase 5 without compromising hotel identity.
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
