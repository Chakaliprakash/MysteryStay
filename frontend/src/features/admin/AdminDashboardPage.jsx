import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Building, 
  CreditCard, 
  Users, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hotelService } from '../../services/hotelService';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    const data = await hotelService.getAdminHotels();
    if (data.length > 0) {
      setHotels(data);
    } else {
      // Sample admin hotel ledger
      setHotels([
        {
          id: 1,
          name: 'The Confidential Palace',
          brandChain: 'Palace Group',
          city: 'Mumbai',
          zoneArea: 'Bandra West',
          starRating: 5,
          phone: '+912233445566',
          email: 'concierge@palace.com',
          verified: true
        },
        {
          id: 2,
          name: 'Azure Collectionindiranagar',
          brandChain: 'Azure Hotels',
          city: 'Bangalore',
          zoneArea: 'Indiranagar',
          starRating: 5,
          phone: '+918023456789',
          email: 'partner@azure.com',
          verified: false
        }
      ]);
    }
    setLoading(false);
  };

  const handleToggleVerification = async (hotelId, currentStatus) => {
    try {
      await hotelService.verifyHotel(hotelId, !currentStatus);
      setStatusMsg(`Hotel ID #${hotelId} is now ${!currentStatus ? 'VERIFIED' : 'SUSPENDED'}`);
      loadHotels();
    } catch {
      // Local state update for immediate sandbox feedback
      setHotels((prev) =>
        prev.map((h) => (h.id === hotelId ? { ...h, verified: !currentStatus } : h))
      );
      setStatusMsg(`Hotel ID #${hotelId} status updated to ${!currentStatus ? 'VERIFIED' : 'SUSPENDED'}`);
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Platform Governance Console
          </span>
          <h1 className="font-editorial text-4xl text-[#14251F]">
            Compliance & Verification Ledger
          </h1>
          <p className="text-xs text-[#5A626A] mt-1">
            Logged in as <strong>{user?.fullName || 'Elena Rostova'}</strong> (Administrator)
          </p>
        </div>

        {statusMsg && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-[#0D8A5E] text-xs font-semibold rounded-xl">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <span className="text-xs font-bold uppercase text-[#5A626A]">Managed Properties</span>
          <div className="font-editorial text-3xl text-[#14251F]">{hotels.length} Luxury Partners</div>
          <span className="text-[11px] text-[#0D8A5E] font-semibold">100% 5-Star Certified</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <span className="text-xs font-bold uppercase text-[#5A626A]">Total Platform Volume</span>
          <div className="font-editorial text-3xl text-[#14251F]">$148,500 USD</div>
          <span className="text-[11px] text-[#5A626A]">Perishable Room GMV</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <span className="text-xs font-bold uppercase text-[#5A626A]">Platform Commission</span>
          <div className="font-editorial text-3xl text-[#C6A66B]">$22,275 USD</div>
          <span className="text-[11px] text-[#0D8A5E] font-semibold">15% Standard Fee</span>
        </div>
      </div>

      {/* Hotel Verification Table */}
      <div className="bg-white rounded-3xl border border-[#E4DFD5] overflow-hidden shadow-luxury">
        <div className="p-6 border-b border-[#EFECE4] flex justify-between items-center">
          <h3 className="font-editorial text-2xl text-[#14251F]">
            Hotel Partner Verification Ledger
          </h3>
          <span className="text-xs text-[#5A626A]">
            Enforcing strict 5-star standard adherence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-[#5A626A] font-bold uppercase tracking-wider border-b border-[#E4DFD5]">
              <tr>
                <th className="py-4 px-6">Hotel ID</th>
                <th className="py-4 px-6">Official Property Name</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Star Rating</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Compliance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE4] text-[#1C1F24]">
              {hotels.map((h) => (
                <tr key={h.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#14251F]">#{h.id}</td>
                  <td className="py-4 px-6 font-semibold">
                    <div>{h.name}</div>
                    <div className="text-[10px] text-[#5A626A]">{h.brandChain} • {h.email}</div>
                  </td>
                  <td className="py-4 px-6">{h.city}, {h.zoneArea}</td>
                  <td className="py-4 px-6 font-bold text-[#8C6D32]">★ {h.starRating}.0</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        h.verified
                          ? 'bg-emerald-50 text-[#0D8A5E] border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {h.verified ? 'VERIFIED' : 'PENDING REVIEW'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleToggleVerification(h.id, h.verified)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                        h.verified
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-[#14251F] text-white hover:bg-[#1A2F27]'
                      }`}
                    >
                      {h.verified ? 'Suspend Hotel' : 'Verify & Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
