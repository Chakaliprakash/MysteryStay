import React, { useState, useEffect } from 'react';
import { checkSystemHealth, registerUser, loginUser, fetchCurrentUser, logoutUser } from './api/client';
import { Shield, Sparkles, Database, CheckCircle2, AlertCircle, RefreshCw, Layers, Key, UserCheck, LogOut, Lock } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auth State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: 'traveler@mysterystay.com',
    password: 'Password123!',
    fullName: 'Alex Morgan',
    role: 'ROLE_CUSTOMER'
  });
  const [authResponse, setAuthResponse] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkSystemHealth();
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Check if user session exists
    const token = localStorage.getItem('mystery_access_token');
    if (token) {
      loadProfile();
    }
  }, []);

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
        res = await registerUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role
        });
        setAuthMessage({ type: 'success', text: 'Registration successful! JWT tokens issued.' });
      } else {
        res = await loginUser({
          email: formData.email,
          password: formData.password
        });
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

  const handleLogout = async () => {
    try {
      await logoutUser(authResponse?.refreshToken);
    } catch {
      // Ignored
    }
    setAuthResponse(null);
    setCurrentUser(null);
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
                  Phase 2: Auth Active
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
            <span>Spring Security 6 • Stateless JWT • RBAC</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Unsold Luxury,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-400">
              Guaranteed Value
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Helping 4 & 5-star hotels monetize unsold room inventory without compromising retail rate integrity. 
            Hotel names remain masked until booking confirmation.
          </p>
        </div>

        {/* Interactive Authentication Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Phase 2: Security & Authentication Testbench</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Test JWT issuance, BCrypt password validation, and Role-Based Access Control endpoints.
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="name@mysterystay.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
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
                  <button
                    onClick={loadProfile}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
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
                  No active session. Sign in or register to inspect issued JWT claims and validated Spring Security Principal.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Diagnostics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-400">Backend Status</span>
              {health?.status === 'UP' ? (
                <span className="inline-flex items-center space-x-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>UP</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{loading ? 'Checking...' : 'Standby'}</span>
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Database:</span>
                <span className="text-emerald-400 font-semibold">{health?.details?.database || 'MySQL 8.4 / 9.x'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Migrations:</span>
                <span>Flyway V1 + V2 Applied</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security:</span>
                <span className="text-indigo-400">BCrypt 12 + JWT</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-4">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Security Architecture</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Stateless JWT</strong> (15-min access expiration)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Opaque Refresh Token</strong> (Rotated on use)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Unified 401 & 403 JSON</strong> Handlers</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Role-Based Access Control</strong> (RBAC)</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-4">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Next Milestones</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="font-semibold">Phase 2:</span> Completed & Verified
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Phase 3:</span> Hotel Verification & Management
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Phase 4:</span> Inventory Engine with Pessimistic Locking
              </div>
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
