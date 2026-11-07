import React, { useState, useEffect } from 'react';
import { checkSystemHealth } from './api/client';
import { Shield, Sparkles, Database, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

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
                <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Phase 1: Foundation
                </span>
              </h1>
              <p className="text-xs text-slate-400">Intelligent Mystery Hotel Booking Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Backend</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Identity-Masked Hotel Deals</span>
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

        {/* System Diagnostics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Backend & DB Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-400">Backend Connectivity</span>
              {health?.status === 'UP' ? (
                <span className="inline-flex items-center space-x-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>UP</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{loading ? 'Checking...' : 'Standby / Offline'}</span>
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Service:</span>
                <span>{health?.service || 'MysteryStay Monolith'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Version:</span>
                <span>{health?.version || '1.0.0-PHASE1'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Database:</span>
                <span className="text-emerald-400 font-semibold">{health?.details?.database || 'MySQL 8.4 / 9.x'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Engine:</span>
                <span>Flyway V1 Validated</span>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                Note: {error}
              </p>
            )}
          </div>

          {/* Card 2: Architecture Highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-4">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Modular Monolith Stack</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span><strong>Java 21 + Spring Boot 3.3.5</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span><strong>Spring Data JPA & Hibernate</strong> (validate mode)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span><strong>Flyway Versioned Migrations</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span><strong>React + Vite + Tailwind CSS</strong></span>
              </li>
            </ul>
          </div>

          {/* Card 3: Next Milestones */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300 mb-4">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Upcoming Milestones</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Phase 2:</span> JWT Authentication & Role-Based Access Control
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Phase 3:</span> Hotel Verification & Management
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Phase 4:</span> Inventory Engine with Pessimistic Row Locking
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
